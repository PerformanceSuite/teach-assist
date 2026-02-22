"""
Rubric Templates

Provides built-in rubric templates and custom rubric storage for subject-agnostic
narrative synthesis and grading workflows.
"""

import uuid
from datetime import datetime
from typing import Dict, List, Optional

import structlog
from pydantic import BaseModel, Field

logger = structlog.get_logger(__name__)


# --- Schemas ---


class RubricCriterion(BaseModel):
    """A single criterion in a rubric template."""
    id: str
    name: str
    strand_i: Optional[str] = None
    strand_ii: Optional[str] = None
    strand_iii: Optional[str] = None
    max_score: int = 8


class RubricTemplate(BaseModel):
    """A complete rubric template with metadata."""
    template_id: str
    name: str
    subject: str
    description: str
    criteria: List[RubricCriterion]
    is_builtin: bool = True
    created_at: Optional[str] = None


# --- Built-in Templates ---


IB_MYP_SCIENCE = RubricTemplate(
    template_id="ib_myp_science",
    name="IB MYP Science",
    subject="Science",
    description="IB MYP Science criteria A-D (Knowing, Inquiring, Processing, Reflecting)",
    criteria=[
        RubricCriterion(
            id="A_knowing",
            name="Knowing and Understanding",
            strand_i="Describe scientific knowledge",
            strand_ii="Apply scientific knowledge to solve problems",
            strand_iii="Analyze and evaluate information",
            max_score=8,
        ),
        RubricCriterion(
            id="B_inquiring",
            name="Inquiring and Designing",
            strand_i="Describe a problem or question",
            strand_ii="Formulate a testable hypothesis",
            strand_iii="Design scientific investigations",
            max_score=8,
        ),
        RubricCriterion(
            id="C_processing",
            name="Processing and Evaluating",
            strand_i="Present collected and transformed data",
            strand_ii="Interpret data and explain results",
            strand_iii="Evaluate validity of hypothesis and method",
            max_score=8,
        ),
        RubricCriterion(
            id="D_reflecting",
            name="Reflecting on the Impacts of Science",
            strand_i="Summarize the ways science is applied",
            strand_ii="Describe and summarize implications",
            strand_iii="Apply communication modes effectively",
            max_score=8,
        ),
    ],
    is_builtin=True,
)

IB_MYP_DESIGN = RubricTemplate(
    template_id="ib_myp_design",
    name="IB MYP Design Technology",
    subject="Design Technology",
    description="IB MYP Design Technology criteria A-D (Inquiring, Developing, Creating, Evaluating)",
    criteria=[
        RubricCriterion(
            id="A_inquiring",
            name="Inquiring and Analysing",
            strand_i="Explain and justify the need for a solution",
            strand_ii="Construct a research plan",
            strand_iii="Analyse existing products for inspiration",
            max_score=8,
        ),
        RubricCriterion(
            id="B_developing",
            name="Developing Ideas",
            strand_i="Develop design specifications",
            strand_ii="Present feasible design ideas",
            strand_iii="Present the chosen design with justification",
            max_score=8,
        ),
        RubricCriterion(
            id="C_creating",
            name="Creating the Solution",
            strand_i="Construct a logical plan for creation",
            strand_ii="Demonstrate technical skills",
            strand_iii="Follow the plan to create the solution",
            max_score=8,
        ),
        RubricCriterion(
            id="D_evaluating",
            name="Evaluating",
            strand_i="Design testing methods",
            strand_ii="Evaluate the solution against specifications",
            strand_iii="Explain how the solution could be improved",
            max_score=8,
        ),
    ],
    is_builtin=True,
)

IB_MYP_MATH = RubricTemplate(
    template_id="ib_myp_math",
    name="IB MYP Mathematics",
    subject="Mathematics",
    description="IB MYP Mathematics criteria A-D (Knowing, Investigating, Communicating, Applying)",
    criteria=[
        RubricCriterion(
            id="A_knowing",
            name="Knowing and Understanding",
            strand_i="Select appropriate mathematics",
            strand_ii="Apply mathematics in familiar and unfamiliar situations",
            strand_iii="Solve problems in both familiar and unfamiliar contexts",
            max_score=8,
        ),
        RubricCriterion(
            id="B_investigating",
            name="Investigating Patterns",
            strand_i="Select and apply problem-solving techniques",
            strand_ii="Describe patterns as general rules",
            strand_iii="Verify and justify these general rules",
            max_score=8,
        ),
        RubricCriterion(
            id="C_communicating",
            name="Communicating",
            strand_i="Use appropriate mathematical language",
            strand_ii="Use appropriate forms of mathematical representation",
            strand_iii="Move between different forms of representation",
            max_score=8,
        ),
        RubricCriterion(
            id="D_applying",
            name="Applying Mathematics in Real-life Contexts",
            strand_i="Identify relevant elements of authentic real-life situations",
            strand_ii="Select appropriate mathematical strategies",
            strand_iii="Apply the selected mathematical strategies to reach a solution",
            max_score=8,
        ),
    ],
    is_builtin=True,
)

IB_MYP_INDIVIDUALS_SOCIETIES = RubricTemplate(
    template_id="ib_myp_individuals_societies",
    name="IB MYP Individuals & Societies",
    subject="Individuals & Societies",
    description="IB MYP I&S criteria A-D (Knowing, Investigating, Communicating, Thinking Critically)",
    criteria=[
        RubricCriterion(
            id="A_knowing",
            name="Knowing and Understanding",
            strand_i="Use terminology accurately",
            strand_ii="Demonstrate knowledge and understanding",
            max_score=8,
        ),
        RubricCriterion(
            id="B_investigating",
            name="Investigating",
            strand_i="Formulate a clear research question",
            strand_ii="Follow an action plan to investigate a research question",
            strand_iii="Evaluate the research process and results",
            max_score=8,
        ),
        RubricCriterion(
            id="C_communicating",
            name="Communicating",
            strand_i="Communicate information and ideas",
            strand_ii="Organize information and ideas effectively",
            strand_iii="List sources of information in a recognized format",
            max_score=8,
        ),
        RubricCriterion(
            id="D_thinking",
            name="Thinking Critically",
            strand_i="Discuss concepts, issues, models, visual representation, theories",
            strand_ii="Synthesize information to make valid arguments",
            strand_iii="Analyse and evaluate a range of sources in terms of origin, purpose, and content",
            max_score=8,
        ),
    ],
    is_builtin=True,
)


# --- Registry ---


BUILTIN_TEMPLATES: Dict[str, RubricTemplate] = {
    t.template_id: t
    for t in [IB_MYP_SCIENCE, IB_MYP_DESIGN, IB_MYP_MATH, IB_MYP_INDIVIDUALS_SOCIETIES]
}

# In-memory storage for custom rubrics (v0.1)
_custom_templates: Dict[str, RubricTemplate] = {}


# --- Public API ---


def list_templates() -> List[RubricTemplate]:
    """Return all available rubric templates (builtin + custom)."""
    all_templates = list(BUILTIN_TEMPLATES.values()) + list(_custom_templates.values())
    return all_templates


def get_template(template_id: str) -> Optional[RubricTemplate]:
    """Get a rubric template by ID."""
    if template_id in BUILTIN_TEMPLATES:
        return BUILTIN_TEMPLATES[template_id]
    return _custom_templates.get(template_id)


def save_custom_template(
    name: str,
    subject: str,
    description: str,
    criteria: List[RubricCriterion],
) -> RubricTemplate:
    """Save a custom rubric template."""
    template_id = f"custom_{uuid.uuid4().hex[:8]}"
    template = RubricTemplate(
        template_id=template_id,
        name=name,
        subject=subject,
        description=description,
        criteria=criteria,
        is_builtin=False,
        created_at=datetime.utcnow().isoformat(),
    )
    _custom_templates[template_id] = template
    logger.info("custom_rubric_saved", template_id=template_id, name=name)
    return template


def get_criteria_prompt_block(template: RubricTemplate) -> str:
    """Generate a criteria reference block for LLM prompts."""
    lines = [f"{template.name} CRITERIA REFERENCE:"]
    for c in template.criteria:
        parts = [c.name]
        if c.strand_i:
            parts.append(c.strand_i)
        if c.strand_ii:
            parts.append(c.strand_ii)
        if c.strand_iii:
            parts.append(c.strand_iii)
        lines.append(f"- Criterion {c.id.split('_')[0].upper()} ({c.name}): {', '.join(parts[1:])}")
    return "\n".join(lines)
