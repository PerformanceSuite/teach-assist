"""
Test Inner Council with a Real Lesson Plan

This test submits a realistic 6th grade science lesson plan to all four
Inner Council advisors and displays their structured feedback.

Run with:
    cd backend
    python -m tests.test_council_with_lesson
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
# REALISTIC LESSON PLAN - 6th Grade Science: Forces and Motion
# =============================================================================

LESSON_PLAN = """
# Lesson Plan: Introduction to Forces and Motion

## Basic Information
- **Grade Level:** 6th Grade
- **Subject:** Physical Science
- **Duration:** 50 minutes
- **Unit:** Forces and Motion (Lesson 2 of 8)

## Learning Target
"I can describe how forces affect the motion of objects."

## Standards Addressed
- NGSS MS-PS2-2: Plan an investigation to provide evidence that the change in
  an object's motion depends on the sum of the forces acting on it and the
  mass of the object.

## Materials
- Toy cars (10)
- Ramps made from cardboard (10)
- Rulers
- Student lab notebooks
- Forces and Motion vocabulary cards

## Lesson Structure

### Opening (8 minutes)
- Bell ringer: "Think of a time you pushed or pulled something. What happened?"
- Brief discussion: Elicit examples from students
- Vocabulary review: Force, motion, push, pull

### Direct Instruction (15 minutes)
- Define force as a push or pull
- Explain that forces can change motion (speed up, slow down, change direction)
- Show video clip (3 min) of forces in everyday life
- Model: Push a toy car gently, then harder - observe difference

### Guided Practice (15 minutes)
- Lab activity: Students work in pairs
- Procedure: Roll car down ramps of different heights
- Record observations in lab notebook
- Guiding question: "What happens to the car's motion when you change the
  ramp height?"

### Independent Practice (7 minutes)
- Worksheet: Identify forces in 5 scenarios
- Match push/pull to resulting motion

### Closing (5 minutes)
- Exit ticket: "Name one force and describe how it changes motion"
- Preview tomorrow: Measuring force with spring scales

## Differentiation
- Struggling learners: Vocabulary word bank provided, work with partner
- Advanced learners: Predict what would happen with heavier cars

## Assessment
- Formative: Observation during lab, exit ticket
- Lab notebook entries will be reviewed

## Homework
Complete the "Forces at Home" worksheet - identify 5 forces you use at home
"""

TEACHER_QUESTION = """
I'm planning this lesson for next week. A few concerns:
1. Is the learning target strong enough for the standards?
2. The lab activity feels basic - should I make it more rigorous?
3. Any accessibility issues I might be missing?
4. Is this going to take too much prep time? I only have Sunday evening.

What feedback can each of you offer?
"""


# =============================================================================
# TEST RUNNER
# =============================================================================

def run_council_test():
    """Test the Inner Council with the lesson plan."""

    print("=" * 70)
    print("INNER COUNCIL TEST: Forces and Motion Lesson Plan")
    print("=" * 70)
    print()

    # Check for API key
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set in environment")
        print("\nTo run this test:")
        print("  export ANTHROPIC_API_KEY=your-key-here")
        print("  python -m tests.test_council_with_lesson")
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
    print("Topic: Introduction to Forces and Motion")
    print("Grade: 6th Grade Science")
    print("Duration: 50 minutes")
    print("Standard: NGSS MS-PS2-2")
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
Grade: 6
Subject: science

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
