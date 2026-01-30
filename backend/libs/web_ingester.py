"""
Web Ingester Service for TeachAssist

Fetches and parses web pages for ingestion into the knowledge base.
Supports HTML pages with smart content extraction.

Features:
- Async HTTP fetching with httpx
- HTML parsing with BeautifulSoup
- Script/style/nav removal for clean content
- Timeout and error handling
- Support for various encodings
"""

import re
from typing import Optional
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

import structlog

logger = structlog.get_logger(__name__)


class WebIngesterError(Exception):
    """Base exception for web ingester errors."""
    pass


class InvalidUrlError(WebIngesterError):
    """Raised when URL is invalid or malformed."""
    pass


class FetchError(WebIngesterError):
    """Raised when fetching URL fails."""
    pass


class ParseError(WebIngesterError):
    """Raised when parsing HTML fails."""
    pass


def validate_url(url: str) -> str:
    """
    Validate and normalize a URL.

    Args:
        url: The URL to validate

    Returns:
        Normalized URL string

    Raises:
        InvalidUrlError: If URL is invalid
    """
    if not url or not url.strip():
        raise InvalidUrlError("URL cannot be empty")

    url = url.strip()

    # Add https:// if no scheme provided
    if not url.startswith(('http://', 'https://')):
        url = f'https://{url}'

    try:
        parsed = urlparse(url)

        # Validate scheme
        if parsed.scheme not in ('http', 'https'):
            raise InvalidUrlError(f"Invalid URL scheme: {parsed.scheme}")

        # Validate host
        if not parsed.netloc:
            raise InvalidUrlError("URL must have a valid domain")

        # Block localhost and private IPs for security
        host = parsed.netloc.lower().split(':')[0]
        blocked_hosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1']
        if host in blocked_hosts:
            raise InvalidUrlError("Local URLs are not allowed")

        # Block private IP ranges
        if re.match(r'^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)', host):
            raise InvalidUrlError("Private IP addresses are not allowed")

        return url

    except InvalidUrlError:
        raise
    except Exception as e:
        raise InvalidUrlError(f"Invalid URL format: {str(e)}")


def extract_text_content(html: str, url: str) -> dict:
    """
    Extract clean text content from HTML.

    Removes scripts, styles, navigation, and other non-content elements.

    Args:
        html: Raw HTML string
        url: Source URL (for title fallback)

    Returns:
        Dict with title, content, and metadata

    Raises:
        ParseError: If HTML parsing fails
    """
    try:
        soup = BeautifulSoup(html, 'html.parser')

        # Remove unwanted elements
        unwanted_tags = [
            'script', 'style', 'nav', 'footer', 'header',
            'noscript', 'iframe', 'form', 'aside', 'svg',
            'button', 'input', 'select', 'textarea'
        ]
        for tag in unwanted_tags:
            for element in soup.find_all(tag):
                element.decompose()

        # Remove comments
        from bs4 import Comment
        for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
            comment.extract()

        # Remove hidden elements
        for element in soup.find_all(attrs={'style': re.compile(r'display:\s*none', re.I)}):
            element.decompose()
        for element in soup.find_all(attrs={'hidden': True}):
            element.decompose()
        for element in soup.find_all(class_=re.compile(r'hidden|d-none|invisible', re.I)):
            element.decompose()

        # Extract title
        title = None

        # Try og:title first
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            title = og_title['content'].strip()

        # Then try regular title tag
        if not title:
            title_tag = soup.find('title')
            if title_tag and title_tag.string:
                title = title_tag.string.strip()

        # Then try h1
        if not title:
            h1_tag = soup.find('h1')
            if h1_tag:
                title = h1_tag.get_text(strip=True)

        # Fallback to URL
        if not title:
            title = url

        # Clean up title (remove site name suffixes like "- Medium", "| Blog")
        title = re.sub(r'\s*[\|\-\u2013\u2014]\s*[^|\-\u2013\u2014]+$', '', title).strip()

        # Extract description for metadata
        description = None
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            description = meta_desc['content'].strip()

        # Try main content areas first
        main_content = None
        for selector in ['main', 'article', '[role="main"]', '.post-content', '.article-content', '.entry-content', '#content']:
            main_element = soup.select_one(selector)
            if main_element:
                main_content = main_element
                break

        # Get text content
        if main_content:
            content = main_content.get_text(separator="\n", strip=True)
        else:
            # Fall back to body
            body = soup.find('body')
            if body:
                content = body.get_text(separator="\n", strip=True)
            else:
                content = soup.get_text(separator="\n", strip=True)

        # Clean up content
        # Remove excessive whitespace
        content = re.sub(r'\n{3,}', '\n\n', content)
        content = re.sub(r' {2,}', ' ', content)
        content = content.strip()

        # Validate we got something useful
        if not content or len(content) < 50:
            raise ParseError("Could not extract meaningful content from page")

        return {
            "title": title,
            "content": content,
            "url": url,
            "description": description,
            "content_length": len(content),
        }

    except ParseError:
        raise
    except Exception as e:
        logger.error("html_parse_failed", url=url, error=str(e))
        raise ParseError(f"Failed to parse HTML: {str(e)}")


async def fetch_and_parse(
    url: str,
    timeout: float = 30.0,
    max_size_mb: float = 10.0,
    user_agent: Optional[str] = None,
) -> dict:
    """
    Fetch a URL and extract its text content.

    Args:
        url: URL to fetch
        timeout: Request timeout in seconds (default: 30)
        max_size_mb: Maximum response size in MB (default: 10)
        user_agent: Custom user agent string

    Returns:
        Dict with:
            - title: Page title
            - content: Extracted text content
            - url: Final URL (after redirects)
            - description: Meta description if available
            - content_length: Length of extracted content

    Raises:
        InvalidUrlError: If URL is invalid
        FetchError: If fetching fails
        ParseError: If parsing fails
    """
    # Validate URL
    url = validate_url(url)

    # Default user agent
    if not user_agent:
        user_agent = "TeachAssist/1.0 (Educational Content Fetcher)"

    headers = {
        "User-Agent": user_agent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    max_size_bytes = int(max_size_mb * 1024 * 1024)

    try:
        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=True,
            max_redirects=5,
        ) as client:
            logger.info("fetching_url", url=url)

            response = await client.get(url, headers=headers)
            response.raise_for_status()

            # Check content type
            content_type = response.headers.get('content-type', '')
            if not any(ct in content_type.lower() for ct in ['text/html', 'application/xhtml']):
                raise FetchError(f"Unsupported content type: {content_type}")

            # Check content length
            content_length = response.headers.get('content-length')
            if content_length and int(content_length) > max_size_bytes:
                raise FetchError(f"Content too large: {int(content_length) / 1024 / 1024:.1f}MB")

            # Get final URL (after redirects)
            final_url = str(response.url)

            # Get HTML content
            html = response.text

            if len(html) > max_size_bytes:
                raise FetchError(f"Content too large: {len(html) / 1024 / 1024:.1f}MB")

            logger.info(
                "url_fetched",
                url=url,
                final_url=final_url,
                status_code=response.status_code,
                content_length=len(html),
            )

            # Parse and extract content
            result = extract_text_content(html, final_url)

            logger.info(
                "content_extracted",
                url=final_url,
                title=result["title"][:50] if result["title"] else None,
                content_length=result["content_length"],
            )

            return result

    except httpx.TimeoutException:
        logger.warning("fetch_timeout", url=url, timeout=timeout)
        raise FetchError(f"Request timed out after {timeout} seconds")

    except httpx.TooManyRedirects:
        logger.warning("too_many_redirects", url=url)
        raise FetchError("Too many redirects")

    except httpx.HTTPStatusError as e:
        logger.warning("http_error", url=url, status_code=e.response.status_code)
        status_code = e.response.status_code
        if status_code == 404:
            raise FetchError("Page not found (404)")
        elif status_code == 403:
            raise FetchError("Access forbidden (403)")
        elif status_code == 401:
            raise FetchError("Authentication required (401)")
        elif status_code >= 500:
            raise FetchError(f"Server error ({status_code})")
        else:
            raise FetchError(f"HTTP error {status_code}")

    except httpx.RequestError as e:
        logger.warning("request_error", url=url, error=str(e))
        raise FetchError(f"Failed to connect: {str(e)}")

    except (InvalidUrlError, FetchError, ParseError):
        raise

    except Exception as e:
        logger.error("fetch_failed", url=url, error=str(e), exc_info=True)
        raise FetchError(f"Unexpected error: {str(e)}")
