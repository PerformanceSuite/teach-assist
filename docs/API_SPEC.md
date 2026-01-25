# TeachAssist API Specification

> **Base URL:** `http://localhost:8002/api/v1`
> **Authentication:** Bearer token (session-based, tied to NextAuth)

---

## Overview

The TeachAssist backend provides these API groups:

| Group | Purpose | Endpoints |
|-------|---------|-----------|
| **Health** | System status | 1 |
| **Sources** | Document ingestion & management | 5 |
| **Chat** | Grounded RAG conversations | 3 |
| **Council** | Inner Council advisors | 4 |
| **Grading** | Batch feedback workflows | 6 |
| **Planning** | UbD lesson planning | 4 |

---

## Health API

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "services": {
    "knowledgebeast": "ok",
    "personas": "ok"
  }
}
```

---

## Sources API

Manage documents in the teacher's knowledge base.

### `POST /sources/upload`

Upload a document (PDF, DOCX, TXT, MD).

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: The document file
  - `notebook_id`: (optional) Notebook to add to
  - `metadata`: (optional) JSON with tags, description

**Response:**
```json
{
  "source_id": "src_abc123",
  "filename": "unit3_standards.pdf",
  "pages": 12,
  "chunks": 45,
  "status": "indexed"
}
```

### `POST /sources/url`

Ingest a web page or Google Doc.

**Request:**
```json
{
  "url": "https://www.nextgenscience.org/pe/ms-ps2-1-motion-and-stability-forces-and-interactions",
  "notebook_id": "nb_default"
}
```

**Response:**
```json
{
  "source_id": "src_def456",
  "title": "MS-PS2-1 Motion and Stability",
  "chunks": 8,
  "status": "indexed"
}
```

### `GET /sources`

List all sources.

**Query Params:**
- `notebook_id`: Filter by notebook
- `tag`: Filter by tag

**Response:**
```json
{
  "sources": [
    {
      "source_id": "src_abc123",
      "filename": "unit3_standards.pdf",
      "created_at": "2026-01-24T10:00:00Z",
      "chunks": 45,
      "tags": ["standards", "unit3"]
    }
  ],
  "total": 1
}
```

### `GET /sources/{source_id}`

Get source details and preview.

**Response:**
```json
{
  "source_id": "src_abc123",
  "filename": "unit3_standards.pdf",
  "created_at": "2026-01-24T10:00:00Z",
  "chunks": 45,
  "preview": "This document outlines the NGSS performance expectations for...",
  "metadata": {
    "pages": 12,
    "tags": ["standards", "unit3"]
  }
}
```

### `DELETE /sources/{source_id}`

Remove a source from the knowledge base.

**Response:**
```json
{
  "deleted": true,
  "source_id": "src_abc123"
}
```

---

## Chat API

Grounded RAG conversations over teacher's sources.

### `POST /chat/message`

Send a message and get a grounded response.

**Request:**
```json
{
  "notebook_id": "nb_default",
  "message": "What are the key performance expectations for forces and motion?",
  "conversation_id": "conv_xyz789",
  "include_citations": true
}
```

**Response:**
```json
{
  "response": "Based on your uploaded standards document, the key performance expectations for forces and motion include...",
  "citations": [
    {
      "source_id": "src_abc123",
      "chunk_id": "chunk_12",
      "text": "MS-PS2-1: Apply Newton's Third Law to design a solution...",
      "page": 3,
      "relevance": 0.92
    }
  ],
  "conversation_id": "conv_xyz789",
  "grounded": true
}
```

### `POST /chat/transform`

Apply a transformation to sources.

**Request:**
```json
{
  "notebook_id": "nb_default",
  "transform": "summarize",
  "options": {
    "audience": "students",
    "length": "short"
  },
  "source_ids": ["src_abc123"]
}
```

**Supported Transforms:**
- `summarize` - Create summary (options: audience, length)
- `extract_misconceptions` - Find common student misconceptions
- `map_standards` - Map content to standards
- `generate_questions` - Create discussion questions
- `simplify_language` - Reduce reading level

**Response:**
```json
{
  "transform": "summarize",
  "result": "Forces and motion are about how things move and why...",
  "sources_used": ["src_abc123"],
  "metadata": {
    "audience": "students",
    "reading_level": "grade_6"
  }
}
```

### `GET /chat/conversations`

List conversations.

**Response:**
```json
{
  "conversations": [
    {
      "conversation_id": "conv_xyz789",
      "title": "Forces and Motion Standards",
      "created_at": "2026-01-24T10:30:00Z",
      "message_count": 5
    }
  ]
}
```

---

## Council API

Inner Council advisory personas.

### `GET /council/personas`

List available advisors.

**Response:**
```json
{
  "personas": [
    {
      "name": "standards-guardian",
      "display_name": "Standards Guardian",
      "description": "Reviews lessons and assessments for standards alignment",
      "category": "advisory",
      "tags": ["standards", "alignment", "curriculum"]
    },
    {
      "name": "pedagogy-coach",
      "display_name": "Pedagogy Coach",
      "description": "Guides instructional design toward deeper learning",
      "category": "advisory",
      "tags": ["pedagogy", "instruction", "UbD"]
    },
    {
      "name": "equity-advocate",
      "display_name": "Equity Advocate",
      "description": "Reviews materials for accessibility and inclusion",
      "category": "advisory",
      "tags": ["equity", "accessibility", "UDL"]
    },
    {
      "name": "time-optimizer",
      "display_name": "Time Optimizer",
      "description": "Helps streamline prep and protect teacher time",
      "category": "advisory",
      "tags": ["efficiency", "time", "sustainability"]
    }
  ]
}
```

### `GET /council/personas/{name}`

Get a specific persona's details.

**Response:**
```json
{
  "name": "standards-guardian",
  "display_name": "Standards Guardian",
  "description": "Reviews lessons and assessments for standards alignment",
  "category": "advisory",
  "model": "claude-sonnet-4-20250514",
  "system_prompt_preview": "You are the Standards Guardian, an advisory member of the Inner Council...",
  "tags": ["standards", "alignment", "curriculum"]
}
```

### `POST /council/consult`

Get advice from one or more advisors.

**Request:**
```json
{
  "personas": ["standards-guardian", "pedagogy-coach"],
  "context": {
    "type": "lesson_plan",
    "content": "Lesson: Introduction to Forces\nObjective: Students will understand Newton's First Law\nActivities: Lecture (20 min), Worksheet (15 min), Exit ticket",
    "grade": 6,
    "subject": "science"
  },
  "question": "How can I improve this lesson?"
}
```

**Response:**
```json
{
  "advice": [
    {
      "persona": "standards-guardian",
      "display_name": "Standards Guardian",
      "response": {
        "observations": [
          "This maps to NGSS MS-PS2-1 and MS-PS2-2"
        ],
        "risks": [
          "'Understand' is vague - the standard requires application"
        ],
        "suggestions": [
          "Reframe objective to include application component"
        ],
        "questions": [
          "Will students have a chance to apply the law?"
        ]
      }
    },
    {
      "persona": "pedagogy-coach",
      "display_name": "Pedagogy Coach",
      "response": {
        "observations": [
          "Follows direct instruction model"
        ],
        "risks": [
          "Worksheet focuses on recall, not understanding"
        ],
        "suggestions": [
          "Add prediction moment before lecture",
          "Replace worksheet with think-pair-share"
        ],
        "questions": [
          "Where will you check for understanding mid-lesson?"
        ]
      }
    }
  ],
  "context_received": true
}
```

### `POST /council/chat`

Have an ongoing conversation with an advisor.

**Request:**
```json
{
  "persona": "time-optimizer",
  "conversation_id": "council_conv_123",
  "message": "I spend 3 hours every Sunday grading 50 essays with detailed comments. Help?"
}
```

**Response:**
```json
{
  "persona": "time-optimizer",
  "response": "I see the time pressure. Here are some options...",
  "conversation_id": "council_conv_123",
  "structured_advice": {
    "observations": ["..."],
    "time_risks": ["..."],
    "suggestions": ["..."],
    "questions": ["..."]
  }
}
```

---

## Grading API

Batch feedback workflow for narrative comments.

### `POST /grading/rubrics`

Create or upload a rubric.

**Request:**
```json
{
  "name": "Argument Essay Rubric",
  "criteria": [
    {
      "name": "Claim",
      "levels": [
        {"score": 4, "description": "Clear, specific, arguable claim"},
        {"score": 3, "description": "Clear claim, may lack specificity"},
        {"score": 2, "description": "Vague or overly broad claim"},
        {"score": 1, "description": "Missing or unclear claim"}
      ]
    },
    {
      "name": "Evidence",
      "levels": [
        {"score": 4, "description": "Multiple relevant, cited sources"},
        {"score": 3, "description": "Some evidence, may lack depth"},
        {"score": 2, "description": "Minimal or irrelevant evidence"},
        {"score": 1, "description": "No evidence provided"}
      ]
    }
  ]
}
```

**Response:**
```json
{
  "rubric_id": "rub_abc123",
  "name": "Argument Essay Rubric",
  "criteria_count": 2,
  "created_at": "2026-01-24T11:00:00Z"
}
```

### `GET /grading/rubrics`

List rubrics.

### `POST /grading/batch`

Submit a batch of student work for feedback clustering.

**Request:**
```json
{
  "rubric_id": "rub_abc123",
  "assignment_name": "Forces Essay",
  "submissions": [
    {
      "student_id": "student_A",
      "content": "Newton's first law says objects at rest stay at rest..."
    },
    {
      "student_id": "student_B",
      "content": "Forces make things move. When you push something..."
    }
  ]
}
```

**Response:**
```json
{
  "batch_id": "batch_xyz789",
  "submission_count": 50,
  "status": "processing",
  "estimated_time_seconds": 45
}
```

### `GET /grading/batch/{batch_id}`

Get batch status and results.

**Response:**
```json
{
  "batch_id": "batch_xyz789",
  "status": "complete",
  "clusters": [
    {
      "cluster_id": "cluster_1",
      "pattern": "Strong claim, weak evidence",
      "count": 12,
      "student_ids": ["student_A", "student_C", "..."],
      "draft_comment": "Your claim about Newton's First Law is clear and specific. To strengthen your essay, add specific examples or cite sources that demonstrate this law in action. Consider: what everyday situations show objects staying at rest or in motion?"
    },
    {
      "cluster_id": "cluster_2",
      "pattern": "Good evidence, unclear claim",
      "count": 8,
      "student_ids": ["student_B", "student_D", "..."],
      "draft_comment": "You included great examples of forces in action! To improve, start with a clearer claim statement. Instead of describing what forces do, make an argument about forces that your evidence supports."
    }
  ],
  "unclustered": 3
}
```

### `PUT /grading/batch/{batch_id}/comments`

Update/approve comments for a cluster.

**Request:**
```json
{
  "cluster_id": "cluster_1",
  "approved_comment": "Your claim is clear! Add specific examples to make it even stronger.",
  "apply_to_all": true
}
```

### `GET /grading/batch/{batch_id}/export`

Export comments as CSV.

**Response:** CSV file download
```csv
student_id,cluster,comment
student_A,cluster_1,"Your claim is clear! Add specific examples to make it even stronger."
student_B,cluster_2,"Great examples! Start with a clearer claim statement."
```

---

## Planning API

UbD-aligned lesson and unit planning.

### `POST /planning/unit`

Generate a unit plan scaffold.

**Request:**
```json
{
  "title": "Forces and Motion",
  "grade": 6,
  "subject": "science",
  "duration_weeks": 3,
  "standards": ["MS-PS2-1", "MS-PS2-2"],
  "constraints": {
    "lab_days_per_week": 2,
    "materials_budget": "limited"
  }
}
```

**Response:**
```json
{
  "unit_id": "unit_abc123",
  "title": "Forces and Motion",
  "transfer_goals": [
    "Students will apply understanding of forces to predict and explain motion in real-world situations"
  ],
  "essential_questions": [
    "Why do objects move (or not move)?",
    "How can we predict what will happen when forces act on objects?"
  ],
  "performance_task": {
    "grasps": {
      "goal": "Design a solution to protect an egg in a collision",
      "role": "Safety engineer",
      "audience": "Vehicle safety board",
      "situation": "Test crash protection designs",
      "product": "Prototype + explanation",
      "standards": "Alignment to MS-PS2-1"
    }
  },
  "lesson_sequence": [
    {
      "lesson": 1,
      "title": "What makes things move?",
      "type": "introduction",
      "activities": ["Prediction activity", "Demo", "Discussion"]
    }
  ],
  "status": "draft"
}
```

### `POST /planning/lesson`

Generate a single lesson plan.

**Request:**
```json
{
  "unit_id": "unit_abc123",
  "lesson_number": 3,
  "topic": "Newton's Third Law",
  "duration_minutes": 50,
  "format": "minimum_viable"
}
```

**Response:**
```json
{
  "lesson_id": "lesson_def456",
  "title": "Newton's Third Law: Action and Reaction",
  "learning_target": "I can identify action-reaction force pairs in everyday situations",
  "plan": {
    "opening": {
      "duration": 5,
      "activity": "Prediction: What happens when you push against a wall?"
    },
    "instruction": {
      "duration": 15,
      "activity": "Demo: Skateboard push, balloon rocket",
      "key_points": ["Equal and opposite", "Forces act on different objects"]
    },
    "practice": {
      "duration": 20,
      "activity": "Identify force pairs in scenarios"
    },
    "closing": {
      "duration": 10,
      "activity": "Exit ticket: Draw force pairs for jumping"
    }
  },
  "materials": ["Skateboard", "Balloons", "String", "Exit ticket copies"],
  "differentiation_notes": "Visual learners: force pair diagrams. Kinesthetic: act out scenarios.",
  "format": "minimum_viable"
}
```

### `GET /planning/units`

List saved units.

### `GET /planning/units/{unit_id}`

Get full unit details.

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid rubric format",
    "details": {
      "field": "criteria",
      "issue": "At least one criterion required"
    }
  }
}
```

**Common Error Codes:**
- `validation_error` - Invalid request data
- `not_found` - Resource doesn't exist
- `unauthorized` - Authentication required
- `forbidden` - Not allowed for this user
- `rate_limited` - Too many requests
- `service_error` - Backend service failure

---

## Rate Limits

| Endpoint Group | Limit |
|----------------|-------|
| Chat | 60 requests/minute |
| Council | 30 requests/minute |
| Grading | 10 batches/hour |
| Sources | 100 uploads/day |

---

## WebSocket: Real-time Updates

### `WS /ws/grading/{batch_id}`

Stream grading batch progress.

**Messages:**
```json
{"type": "progress", "processed": 25, "total": 50}
{"type": "cluster_found", "cluster_id": "cluster_1", "pattern": "Strong claim, weak evidence"}
{"type": "complete", "clusters": 5, "unclustered": 3}
```
