# HANDOFF: Plan Studio + Student Integration

> **Created:** 2026-02-10
> **Next Task:** Build Plan Studio with student profile integration

---

## COMPLETED THIS SESSION

1. **Student Profiles Feature** - Full implementation
   - Backend: `backend/libs/student_store.py`, `backend/api/routers/students.py`
   - Frontend: `app/students/page.tsx`, `components/Students/*`, `stores/studentsStore.ts`
   - Fields: name (anonymized), interests, accommodations (IEP/504)
   - Chat integration: Selected students' interests + accommodations injected into AI context

2. **Auth Disabled** - `middleware.ts` - no login required for pilot

3. **AccommodationsToggle Removed** - Was in header, now per-student

---

## NEXT TASK: Plan Studio + Student Integration

### What Exists (Stubs)
- **Frontend:** `app/app/plan/page.tsx` - Placeholder page
- **Backend:** `backend/api/routers/planning.py` - Scaffolded endpoints with TODOs

### What Needs to Be Built

#### Backend (`backend/api/routers/planning.py`)
1. **Unit Planning Endpoint** - `POST /api/v1/planning/unit`
   - Input: subject, grade, standards, duration
   - Output: UbD-style unit plan (Stage 1-3)
   - Use Claude for generation, ground in uploaded sources

2. **Lesson Planning Endpoint** - `POST /api/v1/planning/lesson`
   - Input: unit context, lesson number, **student_ids** (for personalization)
   - Output: Lesson plan with differentiation based on student interests/accommodations
   - When student_ids provided, include personalization suggestions

3. **Storage** - File-based JSON (follow `student_store.py` pattern)

#### Frontend (`app/app/plan/page.tsx`)
1. **Unit Planner Form**
   - Subject, grade level, standards input
   - Duration picker
   - Generate button → shows loading → displays result

2. **Lesson Planner**
   - Select unit context
   - **Student Selector** (reuse `components/Chat/StudentSelector.tsx` pattern)
   - Generate personalized lesson

3. **Results Display**
   - Markdown rendering of plan
   - Copy/export buttons

### Key Integration Point
When generating lessons, if students are selected:
```python
# In planning.py
if request.student_ids:
    students = student_store.get_many(request.student_ids)
    student_context = format_student_context(students)  # interests + accommodations
    # Include in LLM prompt for differentiation suggestions
```

---

## KEY FILES TO REFERENCE

| Purpose | File |
|---------|------|
| Student store pattern | `backend/libs/student_store.py` |
| API router pattern | `backend/api/routers/students.py` |
| Planning stub | `backend/api/routers/planning.py` |
| Student selector UI | `components/Chat/StudentSelector.tsx` |
| Zustand store pattern | `stores/studentsStore.ts` |
| Page pattern | `app/students/page.tsx` |

---

## BACKEND PATTERNS

### LLM Call (from chat.py)
```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    temperature=0.3,
    system=PLANNING_SYSTEM_PROMPT.format(context=context, student_context=student_context),
    messages=[{"role": "user", "content": request.prompt}],
)
```

### Student Context Format (from chat.py)
```python
student_lines = []
for student in students:
    interests_str = ", ".join(student.interests) if student.interests else "not specified"
    accommodations_str = ", ".join(student.accommodations) if student.accommodations else None
    line = f"- {student.name} (interests: {interests_str})"
    if accommodations_str:
        line += f" [accommodations: {accommodations_str}]"
    student_lines.append(line)
```

---

## RUNNING THE APP

```bash
# Backend
cd backend && source .venv/bin/activate && uvicorn api.main:app --reload --port 8002

# Frontend
npm run dev

# Test students API
curl http://localhost:8002/api/v1/students
```

---

## OTHER STUBBED FEATURES (Lower Priority)

These are stubs but NOT needed for pilot:
- Grade Studio (`app/app/grade/page.tsx`)
- Ideas & Hypotheses (`app/app/ideas/page.tsx`)
- Relationships Hub (`app/app/relationships/page.tsx`)
- Professional Portal (`app/app/pro/page.tsx`)

Consider hiding these from nav if not implementing.

---

## GIT STATUS

All changes committed. Current branch: `main`
