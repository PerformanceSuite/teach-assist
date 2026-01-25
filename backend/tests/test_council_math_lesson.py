"""
Test Inner Council with a Math Lesson Plan

This test submits a realistic 7th grade math lesson plan to all four
Inner Council advisors and displays their structured feedback.

Run with:
    cd backend
    python -m tests.test_council_math_lesson
"""

import json
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

# Load .env file before importing anything else
from dotenv import load_dotenv
load_dotenv(backend_path / ".env")

from api.deps import get_anthropic_client, get_persona_store


# =============================================================================
# REALISTIC LESSON PLAN - 7th Grade Math: Proportional Relationships
# =============================================================================

LESSON_PLAN = """
# Lesson Plan: Understanding Proportional Relationships

## Basic Information
- **Grade Level:** 7th Grade
- **Subject:** Mathematics
- **Duration:** 55 minutes
- **Unit:** Ratios and Proportional Relationships (Lesson 4 of 12)

## Learning Target
"I can determine if two quantities are in a proportional relationship by testing
for equivalent ratios."

## Standards Addressed
- CCSS.MATH.CONTENT.7.RP.A.2: Recognize and represent proportional relationships
  between quantities.
- CCSS.MATH.CONTENT.7.RP.A.2.A: Decide whether two quantities are in a proportional
  relationship by testing for equivalent ratios in a table.

## Materials
- Student workbooks
- Graphing paper
- Colored pencils
- "Recipe Cards" handout (class set)
- Document camera
- Calculator (optional, for checking)

## Lesson Structure

### Warm-Up (8 minutes)
- Display: "A recipe uses 2 cups of flour for every 3 cups of sugar."
- Questions:
  - How much flour for 6 cups of sugar?
  - How much flour for 9 cups of sugar?
- Students work independently, then pair-share

### Direct Instruction (15 minutes)
- Define proportional relationship: "Two quantities are proportional if their
  ratios are always equivalent"
- Model with recipe example:
  - Build a ratio table on board
  - Show that 2/3 = 4/6 = 6/9 (all equivalent)
- Introduce the "constant of proportionality" (k = y/x)
- Show a NON-example: "Movie tickets cost $10 each, plus a $5 service fee"
  - Build table: 1 ticket = $15, 2 tickets = $25, 3 tickets = $35
  - Show ratios are NOT equivalent (15/1 ≠ 25/2 ≠ 35/3)

### Guided Practice (15 minutes)
- Recipe Cards activity (pairs):
  - Each pair gets 3 recipe cards with ingredient ratios
  - Task: Determine which recipes show proportional relationships
  - Must show work in ratio table format
  - Record findings on graphic organizer
- Teacher circulates, asks probing questions:
  - "How do you know these ratios are equivalent?"
  - "What's staying constant in this relationship?"

### Independent Practice (12 minutes)
- Workbook problems: 6 scenarios to classify as proportional or not
- Must justify each answer with ratio test
- Early finishers: Create your own proportional and non-proportional examples

### Closing (5 minutes)
- Exit ticket (2 questions):
  1. "The table shows hours worked and money earned. Is this proportional? Explain."
     | Hours | 2 | 4 | 6 |
     | Pay   |$20|$40|$60|
  2. "Give one real-world example of a proportional relationship."

## Differentiation
- Struggling learners: Provide ratio table template, allow calculator use
- Advanced learners: Include scenarios with decimals and fractions
- ELL support: Vocabulary cards with visual examples of "proportional," "equivalent," "constant"

## Assessment
- Formative: Observation during guided practice, exit ticket
- Recipe Cards will be collected and reviewed
- Workbook checked for completion

## Homework
Page 47 problems 1-8: Identify proportional relationships from tables and explain reasoning
"""

TEACHER_QUESTION = """
I'm teaching this tomorrow and feeling a bit rushed on prep. My concerns:
1. The learning target feels wordy - is it hitting the standard correctly?
2. I'm worried the movie ticket non-example might confuse kids more than help
3. Some of my students really struggle with fractions - will this be accessible?
4. The Recipe Cards activity requires me to create the handout tonight - is it worth it or should I simplify?

What does the council think?
"""


# =============================================================================
# TEST RUNNER
# =============================================================================

def run_council_test():
    """Test the Inner Council with the math lesson plan."""

    print("=" * 70)
    print("INNER COUNCIL TEST: Proportional Relationships Lesson Plan")
    print("=" * 70)
    print()

    # Check for API key
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set in environment")
        print("\nTo run this test:")
        print("  export ANTHROPIC_API_KEY=your-key-here")
        print("  python -m tests.test_council_math_lesson")
        return

    # Load persona store
    store = get_persona_store()
    client = get_anthropic_client()

    if client is None:
        print("ERROR: Could not initialize Anthropic client")
        return

    # List all advisors
    personas = store.list(category="advisory")
    print(f"Found {len(personas)} advisors:")
    for p in personas:
        print(f"  - {p.display_name}: {p.description}")
    print()

    # Test each advisor
    advisor_names = [
        "standards-guardian",
        "pedagogy-coach",
        "equity-advocate",
        "time-optimizer"
    ]

    print("-" * 70)
    print("LESSON PLAN SUMMARY")
    print("-" * 70)
    print("Topic: Understanding Proportional Relationships")
    print("Grade: 7th Grade Math")
    print("Duration: 55 minutes")
    print("Standards: CCSS 7.RP.A.2, 7.RP.A.2.A")
    print()
    print("Teacher's Questions:")
    for line in TEACHER_QUESTION.strip().split("\n"):
        if line.strip():
            print(f"  {line}")
    print()

    for advisor_name in advisor_names:
        try:
            persona = store.get(advisor_name)
        except FileNotFoundError:
            print(f"Advisor '{advisor_name}' not found, skipping...")
            continue

        print("=" * 70)
        print(f"ADVISOR: {persona.display_name}")
        print(f"Focus: {persona.description}")
        print("=" * 70)
        print()

        # Build the prompt
        user_message = f"""
Context Type: lesson_plan
Grade: 7
Subject: math

Content to Review:
{LESSON_PLAN}

Teacher's Question:
{TEACHER_QUESTION}

Please provide your advisory feedback following your output format guidelines.
"""

        try:
            print("Consulting advisor...")
            response = client.messages.create(
                model=persona.model,
                max_tokens=persona.max_tokens,
                temperature=persona.temperature,
                system=persona.system_prompt,
                messages=[{"role": "user", "content": user_message}],
            )

            print()
            print(response.content[0].text)
            print()

        except Exception as e:
            print(f"Error: {e}")
            print()

    print("=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    run_council_test()
