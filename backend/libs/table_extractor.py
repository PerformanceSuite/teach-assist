"""
Table Extractor

Extracts tables and structured content from DOCX and PDF documents,
converting them to markdown format for embedding in the knowledge base.
"""

import io
import logging
from pathlib import Path
from typing import List, Optional, Tuple

logger = logging.getLogger(__name__)


def extract_docx_content(file_path: str | Path) -> List[dict]:
    """
    Extract structured content from a DOCX file, preserving table structure.

    Returns a list of content blocks, each with:
    - content: The extracted text (prose or markdown table)
    - content_type: "prose" or "rubric_table" or "table"
    - metadata: Additional info like table dimensions
    """
    try:
        from docx import Document
    except ImportError:
        logger.warning("python-docx not installed, falling back to raw text extraction")
        return _fallback_text_extraction(file_path)

    doc = Document(str(file_path))
    blocks: List[dict] = []

    for element in doc.element.body:
        tag = element.tag.split("}")[-1] if "}" in element.tag else element.tag

        if tag == "p":
            # Paragraph
            text = element.text or ""
            # Gather all runs' text
            for run in element.iter():
                if run.tag.endswith("}t"):
                    pass  # text already captured by element.text
            if text.strip():
                # Accumulate consecutive paragraphs into a single block
                if blocks and blocks[-1]["content_type"] == "prose":
                    blocks[-1]["content"] += "\n" + text.strip()
                else:
                    blocks.append({
                        "content": text.strip(),
                        "content_type": "prose",
                        "metadata": {},
                    })

        elif tag == "tbl":
            # Table — convert to markdown
            table = _find_table_for_element(doc, element)
            if table:
                md_table, is_rubric = _table_to_markdown(table)
                if md_table.strip():
                    blocks.append({
                        "content": md_table,
                        "content_type": "rubric_table" if is_rubric else "table",
                        "metadata": {
                            "rows": len(table.rows),
                            "cols": len(table.columns),
                        },
                    })

    # If we got nothing from structured parsing, fall back
    if not blocks:
        return _fallback_text_extraction(file_path)

    return blocks


def _find_table_for_element(doc, element) -> Optional[object]:
    """Find the python-docx Table object matching the XML element."""
    for table in doc.tables:
        if table._tbl is element:
            return table
    return None


def _table_to_markdown(table) -> Tuple[str, bool]:
    """
    Convert a python-docx Table to markdown format.

    Returns (markdown_string, is_rubric_table).
    A table is considered a rubric if it has criteria-like headers.
    """
    rows_data = []
    for row in table.rows:
        row_cells = []
        for cell in row.cells:
            text = cell.text.strip().replace("\n", " ").replace("|", "/")
            row_cells.append(text)
        rows_data.append(row_cells)

    if not rows_data:
        return "", False

    # Detect if this looks like a rubric table
    is_rubric = _detect_rubric_table(rows_data)

    # Build markdown table
    lines = []

    # Header row
    header = rows_data[0]
    lines.append("| " + " | ".join(header) + " |")
    lines.append("| " + " | ".join(["---"] * len(header)) + " |")

    # Data rows
    for row in rows_data[1:]:
        # Pad row if needed
        while len(row) < len(header):
            row.append("")
        lines.append("| " + " | ".join(row[:len(header)]) + " |")

    return "\n".join(lines), is_rubric


def _detect_rubric_table(rows_data: List[List[str]]) -> bool:
    """Heuristic to detect if a table is a rubric/criteria table."""
    if not rows_data:
        return False

    # Check header and first column for rubric-like keywords
    rubric_keywords = {
        "criterion", "criteria", "level", "score", "band",
        "descriptor", "achievement", "strand", "task-specific",
        "1-2", "3-4", "5-6", "7-8", "0",
        "knowing", "inquiring", "processing", "reflecting",
        "creating", "developing", "evaluating", "communicating",
    }

    all_text = " ".join(
        cell.lower() for row in rows_data[:3] for cell in row
    )
    matches = sum(1 for kw in rubric_keywords if kw in all_text)
    return matches >= 2


def extract_pdf_tables(file_path: str | Path) -> List[dict]:
    """
    Extract tables from PDF files using pdfplumber.

    Returns content blocks similar to extract_docx_content.
    """
    try:
        import pdfplumber
    except ImportError:
        logger.warning("pdfplumber not installed, skipping PDF table extraction")
        return []

    blocks: List[dict] = []

    try:
        with pdfplumber.open(str(file_path)) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                # Extract tables
                tables = page.extract_tables()
                for table_data in tables:
                    if not table_data or len(table_data) < 2:
                        continue

                    # Clean cells
                    cleaned = []
                    for row in table_data:
                        cleaned_row = [
                            (cell or "").strip().replace("\n", " ").replace("|", "/")
                            for cell in row
                        ]
                        cleaned.append(cleaned_row)

                    is_rubric = _detect_rubric_table(cleaned)

                    # Build markdown
                    lines = []
                    header = cleaned[0]
                    lines.append("| " + " | ".join(header) + " |")
                    lines.append("| " + " | ".join(["---"] * len(header)) + " |")
                    for row in cleaned[1:]:
                        while len(row) < len(header):
                            row.append("")
                        lines.append("| " + " | ".join(row[:len(header)]) + " |")

                    md_table = "\n".join(lines)
                    if md_table.strip():
                        blocks.append({
                            "content": md_table,
                            "content_type": "rubric_table" if is_rubric else "table",
                            "metadata": {
                                "page": page_num,
                                "rows": len(cleaned),
                                "cols": len(header),
                            },
                        })

                # Also extract non-table text
                text = page.extract_text()
                if text and text.strip():
                    blocks.append({
                        "content": text.strip(),
                        "content_type": "prose",
                        "metadata": {"page": page_num},
                    })

    except Exception as e:
        logger.error(f"PDF table extraction failed: {e}")

    return blocks


def extract_document(file_path: str | Path) -> List[dict]:
    """
    Smart document extraction that picks the right method based on file type.

    Returns list of content blocks with content_type metadata.
    """
    path = Path(file_path)
    ext = path.suffix.lower()

    if ext == ".docx":
        return extract_docx_content(path)
    elif ext == ".pdf":
        return extract_pdf_tables(path)
    else:
        # Plain text files
        return _fallback_text_extraction(path)


def _fallback_text_extraction(file_path: str | Path) -> List[dict]:
    """Simple text extraction fallback."""
    try:
        with open(str(file_path), "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        if content.strip():
            return [{
                "content": content.strip(),
                "content_type": "prose",
                "metadata": {},
            }]
    except Exception as e:
        logger.error(f"Fallback text extraction failed: {e}")
    return []
