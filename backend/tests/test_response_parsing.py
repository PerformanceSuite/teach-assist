"""
Test structured response parsing for Inner Council.

Run with:
    cd backend
    python -m tests.test_response_parsing
"""

import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from api.routers.council import parse_structured_response, extract_bullets


# Sample advisor responses to test parsing
STANDARDS_GUARDIAN_RESPONSE = """
### Observations
- You've cited **NGSS MS-PS2-2** which requires students to "plan an investigation"
- Your learning target captures the core requirement of the standard
- The progression from concrete examples to abstract testing aligns well

### Alignment Risks
- **Planning gap**: The standard requires students to *plan* investigations, but your lab is teacher-designed
- **Mass variable**: While you mention "heavier cars," mass isn't systematically investigated

### Suggestions
- **Strengthen the learning target**: Consider "I can plan an investigation to show how forces affect motion"
- Add a hands-on investigation component
- Include cars of different masses

### Questions
- Will future lessons address the planning requirements?
- Are you planning lab investigations, or is this primarily conceptual?
"""

EQUITY_ADVOCATE_RESPONSE = """
### Observations
- **Multiple modalities present:** Visual, kinesthetic, verbal, written
- **Collaborative learning:** Pair work naturally supports peer assistance
- **Real-world connections:** Bell ringer connects to students' lived experiences

### Equity Risks

**Physical Accessibility:**
- **Fine motor demands:** Rolling cars and writing may challenge students with motor differences
- **Vision requirements:** Observing car motion assumes clear vision

**Language Barriers:**
- **Academic vocabulary load:** Terms introduced rapidly without scaffolding
- **Reading level concerns:** Worksheet may exceed some students' reading levels

### Suggestions

**Immediate Accessibility Wins:**
- **Multiple recording options:** Allow students to draw, dictate, or use voice recording
- **Flexible positioning:** Set up stations at different heights

**Language Accessibility:**
- **Vocabulary pre-teaching:** Introduce terms with visual examples
- **Sentence frames:** Provide templates like "When I _____ the car, it moved _____"

### Questions
- **Student context:** Do you have students with IEPs/504s?
- **Language learners:** What's your ELL population?
"""

TIME_OPTIMIZER_RESPONSE = """
### Observations
- **Solid time allocation:** Your 50-minute breakdown is realistic
- **Efficient materials:** Simple, reusable items
- **Good structure:** Clear progression

### Time Risks
- **Custom worksheet creation:** Both worksheets require design time
- **Video hunting:** Finding the "perfect" video can become a time sink
- **Lab notebook review:** 30+ entries to read through

### Suggestions

**For Sunday Prep Efficiency:**
- **Skip the custom worksheets:** Use your textbook's existing activities
- **Video shortcut:** Set a 10-minute timer - pick the first decent one
- **Ramp hack:** Use textbooks + rulers instead of cardboard ramps

**For Ongoing Efficiency:**
- **Lab notebook streamlining:** Spot-check 5-6 notebooks per class
- **Reusable vocabulary cards:** Laminate these once

### Questions
- **What's your non-negotiable?** The hands-on lab or the worksheets?
- **Prep time reality:** How much time do you actually have?
- **Reuse potential:** Could this lesson structure work for the whole unit?
"""


def test_parsing():
    """Test the structured response parsing."""

    print("=" * 70)
    print("STRUCTURED RESPONSE PARSING TEST")
    print("=" * 70)
    print()

    test_cases = [
        ("Standards Guardian", STANDARDS_GUARDIAN_RESPONSE),
        ("Equity Advocate", EQUITY_ADVOCATE_RESPONSE),
        ("Time Optimizer", TIME_OPTIMIZER_RESPONSE),
    ]

    for name, response in test_cases:
        print(f"\n{'='*70}")
        print(f"PARSING: {name}")
        print("=" * 70)

        observations, risks, suggestions, questions, raw = parse_structured_response(response)

        print(f"\n📋 OBSERVATIONS ({len(observations)}):")
        for i, obs in enumerate(observations, 1):
            print(f"   {i}. {obs[:80]}{'...' if len(obs) > 80 else ''}")

        print(f"\n⚠️  RISKS ({len(risks)}):")
        for i, risk in enumerate(risks, 1):
            print(f"   {i}. {risk[:80]}{'...' if len(risk) > 80 else ''}")

        print(f"\n💡 SUGGESTIONS ({len(suggestions)}):")
        for i, sug in enumerate(suggestions, 1):
            print(f"   {i}. {sug[:80]}{'...' if len(sug) > 80 else ''}")

        print(f"\n❓ QUESTIONS ({len(questions)}):")
        for i, q in enumerate(questions, 1):
            print(f"   {i}. {q[:80]}{'...' if len(q) > 80 else ''}")

    print("\n" + "=" * 70)
    print("PARSING TEST COMPLETE")
    print("=" * 70)


def test_bullet_extraction():
    """Test bullet point extraction."""

    print("\n" + "=" * 70)
    print("BULLET EXTRACTION TEST")
    print("=" * 70)

    test_text = """
- First bullet point
- Second bullet point with
  continuation on next line
- Third bullet point

1. Numbered item one
2. Numbered item two

**Bold label:** Some content here
- Another bullet after bold
"""

    bullets = extract_bullets(test_text)

    print(f"\nExtracted {len(bullets)} bullets:")
    for i, b in enumerate(bullets, 1):
        print(f"  {i}. {b}")

    print()


if __name__ == "__main__":
    test_bullet_extraction()
    test_parsing()
