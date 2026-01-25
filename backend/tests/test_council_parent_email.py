"""
Test Inner Council with a Parent Email Draft

This test submits a draft parent email to all four Inner Council advisors
and displays their structured feedback.

Run with:
    cd backend
    python -m tests.test_council_parent_email
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
# REALISTIC PARENT EMAIL - Concerns About Student Performance
# =============================================================================

EMAIL_DRAFT = """
Subject: Marcus - Math Class Update

Dear Mr. and Mrs. Thompson,

I hope this email finds you well. I wanted to reach out regarding Marcus's
performance in 7th grade math this quarter.

Marcus is a bright student with a lot of potential, but I've noticed some
concerning patterns lately. He's been turning in assignments late or
incomplete, and his quiz scores have dropped from B's to D's over the past
few weeks. During class, he often seems distracted and has been talking
with friends instead of working on practice problems.

I'm also concerned because Marcus used to participate actively in class
discussions, but lately he's been very quiet and withdrawn. When I asked
him if everything was okay, he just shrugged and said "I guess."

I want to work together to help Marcus get back on track before the end
of the quarter. Here are a few things I think might help:

1. Could we set up a time to talk on the phone or meet after school?
2. I can offer Marcus some extra help during lunch on Tuesdays and Thursdays
3. I'd like to understand if there's anything going on at home that might
   be affecting his focus

Please let me know what times work for you to connect. I really believe
Marcus can succeed in math - he just needs some additional support right now.

Thank you for your partnership,
Ms. Rodriguez
7th Grade Mathematics
Washington Middle School
"""

TEACHER_QUESTION = """
I need to send this email today but I'm second-guessing myself. My concerns:

1. Am I being too negative? I don't want to sound like I'm attacking Marcus
2. The part about "anything going on at home" - is that appropriate or too invasive?
3. Should I include the specific grade drop (B's to D's)? His parents might get upset
4. I'm worried the parents might get defensive - how can I make this feel collaborative?

I really do care about this kid and want to help, but I don't want to make things worse.
"""


# =============================================================================
# TEST RUNNER
# =============================================================================

def run_council_test():
    """Test the Inner Council with the parent email draft."""

    print("=" * 70)
    print("INNER COUNCIL TEST: Parent Email Draft")
    print("=" * 70)
    print()

    # Check for API key
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set in environment")
        print("\nTo run this test:")
        print("  export ANTHROPIC_API_KEY=your-key-here")
        print("  python -m tests.test_council_parent_email")
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
    print("EMAIL DRAFT SUMMARY")
    print("-" * 70)
    print("To: Marcus's parents (Mr. and Mrs. Thompson)")
    print("Re: Declining math performance, behavioral changes")
    print("Tone: Concerned but supportive")
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
Context Type: communication
Grade: 7
Subject: math

Content to Review:
{EMAIL_DRAFT}

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

            response_text = response.content[0].text

            # Parse structured response
            from api.routers.council import parse_structured_response
            observations, risks, suggestions, questions, raw = parse_structured_response(response_text)

            # Display structured output
            print()
            print(f"📋 OBSERVATIONS ({len(observations)}):")
            for obs in observations[:5]:  # Limit to 5 for readability
                print(f"   • {obs[:100]}{'...' if len(obs) > 100 else ''}")

            print(f"\n⚠️  RISKS ({len(risks)}):")
            for risk in risks[:5]:
                print(f"   • {risk[:100]}{'...' if len(risk) > 100 else ''}")

            print(f"\n💡 SUGGESTIONS ({len(suggestions)}):")
            for sug in suggestions[:5]:
                print(f"   • {sug[:100]}{'...' if len(sug) > 100 else ''}")

            print(f"\n❓ QUESTIONS ({len(questions)}):")
            for q in questions[:5]:
                print(f"   • {q[:100]}{'...' if len(q) > 100 else ''}")

            print("\n" + "-" * 40)
            print("RAW RESPONSE (first 500 chars):")
            print(response_text[:500] + "..." if len(response_text) > 500 else response_text)
            print()

        except Exception as e:
            print(f"Error: {e}")
            print()

    print("=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    run_council_test()
