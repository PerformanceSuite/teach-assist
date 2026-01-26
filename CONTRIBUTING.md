# Contributing to TeachAssist

Thank you for your interest in contributing to TeachAssist! This document provides guidelines for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- Be respectful and considerate
- Focus on constructive feedback
- Prioritize the needs of teachers and students
- Maintain the ethical principles outlined in [SPEC.md](./SPEC.md)

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling or personal attacks
- Publishing others' private information
- Any conduct that violates our [ethical framework](./SPEC.md#5-ethical-framework)

---

## Getting Started

### Prerequisites

- **Python 3.11+** for backend development
- **Node.js 18+** for frontend development
- **Git** for version control
- **Anthropic API key** for LLM features

### Understanding the Project

Before contributing, please read:

1. **[README.md](./README.md)** - Quick start and overview
2. **[SPEC.md](./SPEC.md)** - Vision, architecture, and principles
3. **[MASTER_PLAN.md](./MASTER_PLAN.md)** - Current status and roadmap

---

## Development Setup

### Clone the Repository

```bash
git clone https://github.com/PerformanceSuite/teach-assist.git
cd teach-assist
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Start server
uvicorn api.main:app --reload --port 8002
```

### Frontend Setup

```bash
# From project root
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8002

# Start dev server
npm run dev
```

### Verify Setup

- Backend health: http://localhost:8002/health
- Frontend: http://localhost:3000

---

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Include:**
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (OS, Python/Node versions)
   - Screenshots if applicable

### Suggesting Features

1. **Check existing feature requests**
2. **Review the roadmap** in [MASTER_PLAN.md](./MASTER_PLAN.md)
3. **Create a feature request** with:
   - Clear description of the feature
   - Use case (how teachers would benefit)
   - Potential implementation approach

### Contributing Code

1. **Check open issues** for work that needs doing
2. **Comment on the issue** to claim it
3. **Fork the repository**
4. **Create a feature branch** from `main`
5. **Make your changes**
6. **Submit a pull request**

---

## Pull Request Process

### Before Submitting

- [ ] Code follows our [coding standards](#coding-standards)
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up-to-date with `main`

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Added/updated tests
- [ ] Updated documentation
```

### Review Process

1. Submit PR against `main` branch
2. Automated checks run (linting, tests)
3. Maintainer reviews code
4. Address feedback if needed
5. Maintainer merges approved PR

---

## Coding Standards

### TypeScript (Frontend)

```typescript
// Use TypeScript for all frontend code
// Prefer explicit types over `any`
// Use functional components with hooks

// Good
const SourceList: React.FC<{ sources: Source[] }> = ({ sources }) => {
  const [selected, setSelected] = useState<string | null>(null);
  // ...
};

// Avoid
const SourceList = ({ sources }: any) => {
  // ...
};
```

### Python (Backend)

```python
# Use type hints
# Follow PEP 8 style guide
# Use async/await for I/O operations

# Good
async def upload_source(file: UploadFile, title: str) -> SourceResponse:
    """Upload and index a document."""
    content = await file.read()
    # ...

# Avoid
def upload_source(file, title):
    content = file.read()
    # ...
```

### General Guidelines

- **Keep functions small** - Single responsibility
- **Use descriptive names** - Self-documenting code
- **Add comments** - For complex logic only
- **Handle errors** - Graceful degradation
- **No secrets in code** - Use environment variables

---

## Testing

### Backend Tests

```bash
cd backend
source .venv/bin/activate

# Run tests
pytest

# Run with coverage
pytest --cov=api
```

### Frontend Tests

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Manual Testing Checklist

Before submitting a PR, verify:

- [ ] Upload a document works
- [ ] Ask a question returns grounded answer
- [ ] Inner Council provides structured advice
- [ ] Keyboard shortcuts work (Cmd+/, Cmd+.)
- [ ] Mobile responsive (test on phone)

---

## Documentation

### When to Update Docs

- Adding new features → Update README.md, SPEC.md
- Changing API → Update docs/API_SPEC.md
- Adding help content → Update data/helpContent.ts
- Architecture changes → Update docs/ARCHITECTURE.md

### Documentation Style

- Use clear, simple language
- Include code examples
- Add screenshots for UI features
- Keep formatting consistent

---

## Branch Naming

| Prefix | Use For |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code refactoring |
| `test/` | Test additions |

Example: `feature/grade-studio`, `fix/council-timeout`

---

## Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(council): add time-optimizer persona
fix(chat): handle empty search results
docs(readme): update deployment instructions
```

---

## Questions?

- **General questions:** Open a GitHub Discussion
- **Bug reports:** Open an Issue
- **Security issues:** Email maintainers directly (do not open public issue)

---

## Recognition

Contributors are recognized in:
- GitHub Contributors list
- Release notes
- README.md (for significant contributions)

---

Thank you for contributing to TeachAssist! Your work helps teachers everywhere.
