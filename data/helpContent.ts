/**
 * Help Content - Articles and categories for the Help Center (Teacher-specific)
 *
 * This file provides the 15 teacher-specific help articles organized by category.
 * Content is defined inline for fast client-side rendering.
 * For markdown-based content, see lib/helpArticles.ts
 */

export interface HelpArticle {
  id: string
  title: string
  category: string
  tags: string[]
  content: string
  relatedArticles?: string[]
}

export interface HelpCategory {
  id: string
  name: string
  icon: string
  description: string
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: 'Rocket',
    description: 'Learn the basics of TeachAssist',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    icon: 'FileText',
    description: 'Managing your teaching materials',
  },
  {
    id: 'inner-council',
    name: 'Inner Council',
    icon: 'Users',
    description: 'Working with AI advisors',
  },
  {
    id: 'narratives',
    name: 'Narrative Synthesis',
    icon: 'PenTool',
    description: 'Generating report card comments',
  },
  {
    id: 'reference',
    name: 'Reference',
    icon: 'BookOpen',
    description: 'Quick reference guides',
  },
]

export const HELP_ARTICLES: HelpArticle[] = [
  // ============================================
  // GETTING STARTED (3 articles)
  // ============================================
  {
    id: 'welcome',
    title: 'Welcome to TeachAssist',
    category: 'getting-started',
    tags: ['overview', 'introduction', 'basics', 'getting started'],
    content: `TeachAssist is your teaching intelligence system designed to help you work smarter, not harder. Built by teachers, for teachers.

**What TeachAssist Does**

- **Knowledge Base**: Upload your curriculum standards, lesson plans, and teaching materials. TeachAssist learns from your sources and provides answers grounded in your actual documents.
- **Grounded Chat**: Ask questions and get answers that cite your uploaded sources. No hallucinations, no generic advice.
- **Inner Council**: Consult specialized AI advisors who provide structured feedback from different perspectives.
- **Narrative Synthesis**: Generate draft report card comments based on criteria. You review and edit.

**Core Principles**

1. **Teacher Authority** - You make all final decisions. AI assists but never replaces professional judgment.
2. **Privacy First** - Student data stays private. TeachAssist is designed for FERPA compliance.
3. **Grounded Responses** - Every answer cites your sources. No made-up information.
4. **No AI Grading** - TeachAssist will never assign grades or scores to student work.

**Getting Started**

1. Upload Sources - Start with curriculum standards or a lesson plan
2. Ask Questions - Try the grounded chat
3. Meet Your Council - Consult an advisor for structured feedback
4. Explore Features - Use keyboard shortcuts to work faster`,
    relatedArticles: ['quick-start', 'privacy-first'],
  },
  {
    id: 'quick-start',
    title: 'Quick Start Guide',
    category: 'getting-started',
    tags: ['quick start', 'tutorial', 'setup', '5 minutes'],
    content: `Get productive with TeachAssist in under 5 minutes.

**Step 1: Upload Your First Source (1 minute)**

1. Click **Upload Sources** on the home page
2. Select a PDF or Word document (curriculum standards work great)
3. Add a descriptive title like "8th Grade Science Standards"
4. Wait for processing (usually under 30 seconds)

**Step 2: Ask a Question (1 minute)**

1. Navigate to **Chat** or press \`Cmd+J\`
2. Type a question about your uploaded content
3. Press Enter

Try: "What are the key learning objectives in this document?"

**Step 3: Consult Your Council (2 minutes)**

1. Navigate to **Inner Council**
2. Choose an advisor based on your need
3. Provide context and ask your question

**Step 4: Learn Key Shortcuts**

- \`Cmd+K\` - Command Palette
- \`Cmd+J\` - Toggle Chat
- \`Cmd+/\` - Help Center
- \`Cmd+U\` - Upload Document

**What's Next?**

- Upload more sources (lesson plans, IEPs, teaching frameworks)
- Try different advisors for various perspectives
- Learn about privacy protections
- Explore narrative synthesis for report cards`,
    relatedArticles: ['welcome', 'uploading-sources', 'inner-council-intro'],
  },
  {
    id: 'privacy-first',
    title: 'Privacy-First Design',
    category: 'getting-started',
    tags: ['privacy', 'ferpa', 'coppa', 'data protection', 'student privacy'],
    content: `TeachAssist is built from the ground up with student privacy as the top priority.

**FERPA Compliance**

- **Local Data Storage**: All documents stored on your local machine
- **No Student Identifiers Required**: Use anonymized labels like "Student A"
- **Teacher-Controlled Access**: Only you access your data

**What to Upload Safely**

**Safe:**
- Curriculum standards (public documents)
- Lesson plans and unit plans
- Teaching frameworks (UbD, 5E, etc.)
- Anonymized IEPs (student name removed)
- General accommodation guidelines

**Anonymize Before Uploading:**
- IEPs and 504 plans - remove names, DOB, addresses
- Student work samples - remove identifying information

**Never Upload:**
- Student names with grades
- Social security numbers
- Home addresses or contact information
- Medical diagnoses with student names

**The No-Grading Guardrail**

TeachAssist has a hard-coded boundary: it will **never grade student work**.

This protects students from algorithmic bias in assessment and ensures teacher professional judgment remains paramount.

TeachAssist CAN help you:
- Draft feedback comments (you review and edit)
- Align rubrics to standards
- Suggest differentiation strategies
- Generate narrative report card starters

You always make the final call.`,
    relatedArticles: ['entering-student-data', 'welcome'],
  },

  // ============================================
  // KNOWLEDGE BASE (4 articles)
  // ============================================
  {
    id: 'uploading-sources',
    title: 'Uploading Curriculum Sources',
    category: 'knowledge-base',
    tags: ['upload', 'sources', 'documents', 'pdf', 'curriculum'],
    content: `Your knowledge base is the foundation of TeachAssist.

**Supported File Types**

- **PDF** (.pdf) - Standards documents, textbook chapters
- **Word** (.docx) - Lesson plans, unit plans
- **Text** (.txt) - Simple notes, outlines
- **Markdown** (.md) - Structured documentation

**What to Upload**

**Foundation Documents** (upload first)
- State or national curriculum standards
- District curriculum guides
- Scope and sequence documents

**Planning Materials**
- Unit plans and lesson plans
- Teaching frameworks (UbD templates, 5E models)
- Pacing guides

**Student Support**
- Anonymized IEPs and 504 plans
- Differentiation strategy guides
- Accommodation reference sheets

**How to Upload**

1. Click "Upload Sources" or press \`Cmd+U\`
2. Select your file from the file picker
3. Add a descriptive title (helps you find it later)
4. Wait for processing (typically 10-30 seconds)

**Good Titles**
- "NGSS 8th Grade Physical Science Standards"
- "UbD Unit Template - Forces and Motion"
- "IEP Accommodation Strategies (Anonymized)"

**After Upload**

Once processed, your source is immediately available for:
- Grounded Chat questions
- Inner Council consultations
- Search and retrieval`,
    relatedArticles: ['asking-questions', 'understanding-citations'],
  },
  {
    id: 'asking-questions',
    title: 'Asking Grounded Questions',
    category: 'knowledge-base',
    tags: ['chat', 'questions', 'grounded', 'search', 'answers'],
    content: `TeachAssist answers questions using only your uploaded sources. No hallucinations, no generic advice.

**How Grounded Chat Works**

1. You ask a question
2. TeachAssist searches your knowledge base
3. Relevant chunks are retrieved
4. An answer is generated citing those chunks
5. You see the answer with source citations

**Types of Questions**

**Factual Retrieval**
"What are the 8th grade standards for forces and motion?"

**Synthesis Questions**
"How does my lesson plan align with the uploaded standards?"

**Explanation Requests**
"Explain the UbD backwards design process based on my uploaded template."

**Writing Effective Questions**

**Be Specific**
- Less effective: "What are the standards?"
- More effective: "What are the NGSS performance expectations for 8th grade physical science?"

**Include Context**
"Based on the uploaded UbD template, what are the recommended stages for designing a unit on forces?"

**Reference Documents**
"According to the IEP accommodations document, what reading supports are recommended?"

**When Sources Don't Have the Answer**

TeachAssist will say: "I don't have information about this in your uploaded sources."

This is a feature, not a bug - it prevents made-up answers.`,
    relatedArticles: ['understanding-citations', 'uploading-sources'],
  },
  {
    id: 'understanding-citations',
    title: 'Understanding Citations',
    category: 'knowledge-base',
    tags: ['citations', 'sources', 'verification', 'grounded'],
    content: `Every TeachAssist answer cites the source documents it used.

**Why Citations Matter**

- **Verifiability**: Check that the AI accurately represents your sources
- **Traceability**: Know exactly where information comes from
- **No Hallucinations**: If it's not in your sources, TeachAssist won't make it up

**Citation Format**

Citations appear after relevant statements:

"Students should demonstrate understanding of Newton's Third Law..." *[NGSS Standards - Grade 8, Section 3.2]*

**Reading Citations**

**Single Citation**: Information from one source
**Multiple Citations**: Information synthesized from several sources

**Verifying Information**

1. Click the citation to see the source context
2. Read the surrounding text in the original document
3. Confirm accuracy - does the source say what the response claims?

**When to Be Extra Careful**

- Synthesized information from multiple sources
- Paraphrased content (check original wording if precision matters)
- Numerical data (always verify numbers against source)

**Citation Confidence Levels**

- **High**: "The standard explicitly states..."
- **Moderate**: "Based on the document, this likely means..."
- **Low**: "The source doesn't directly address this, but..."`,
    relatedArticles: ['asking-questions', 'uploading-sources'],
  },
  {
    id: 'source-transforms',
    title: 'Using Source Transforms',
    category: 'knowledge-base',
    tags: ['transforms', 'summary', 'key points', 'checklist'],
    content: `Source transforms let you convert and view your uploaded materials in different formats.

**Available Transforms**

**Summary Transform**
Condense lengthy documents into digestible overviews. Use when you need a quick refresher or are sharing highlights.

**Key Points Extract**
Pull out main ideas, objectives, or requirements. Great for identifying essential learning targets or creating assessment blueprints.

**Question Generation**
Create questions based on content. Useful for formative assessments, discussion prompts, or study guides.

**Checklist Conversion**
Turn requirements or standards into actionable checklists. Perfect for planning lesson coverage or tracking accommodations.

**How to Use Transforms**

1. Select a source from your knowledge base
2. Choose a transform from the available options
3. Review the output - transforms are drafts, not final products
4. Edit as needed - add your professional judgment

**Transform Limitations**

Transforms are starting points:
- Always review and edit output
- Transforms may miss nuance or context
- Your professional judgment is essential
- Original source remains unchanged

**Example Workflow**

1. Upload NGSS standards
2. Transform to key points extract
3. Review extracted objectives
4. Upload your unit plan
5. Ask chat "How does my unit align?"
6. Consult Standards Guardian for alignment check`,
    relatedArticles: ['uploading-sources', 'inner-council-intro'],
  },

  // ============================================
  // INNER COUNCIL (3 articles)
  // ============================================
  {
    id: 'inner-council-intro',
    title: 'Meet Your Advisory Council',
    category: 'inner-council',
    tags: ['council', 'advisors', 'personas', 'introduction'],
    content: `The Inner Council is your team of specialized AI advisors.

**The Four Advisors**

**Standards Guardian**
- Role: Curriculum alignment expert
- Ask about: Standards mapping, learning objectives, scope and sequence, assessment-standard connections
- Example: "Does my forces unit cover all NGSS performance expectations for PS2.A?"

**Differentiation Architect**
- Role: Inclusive instruction specialist
- Ask about: UDL, IEP accommodations, ELL supports, gifted modifications
- Example: "How can I modify this lab for a student who needs extended time?"

**Assessment Designer**
- Role: Evaluation and feedback specialist
- Ask about: Formative assessment, rubric design, feedback strategies, progress monitoring
- Example: "What formative assessments could I use during this unit?"

**Curriculum Strategist**
- Role: Big-picture planning expert
- Ask about: Unit planning, vertical alignment, cross-curricular connections, pacing
- Example: "How should I sequence these four physical science units?"

**How the Council Works**

1. Choose an advisor based on your question type
2. Provide context about what you're working on
3. Ask your question naturally
4. Receive structured advice grounded in your sources
5. Apply your judgment - you make all final decisions

**Key Principles**

- Advisors reference your uploaded materials
- Each advisor approaches problems from their expertise
- Teacher authority is paramount
- Advisors never evaluate student work`,
    relatedArticles: ['choosing-advisors', 'interpreting-advice'],
  },
  {
    id: 'choosing-advisors',
    title: 'Choosing the Right Advisor',
    category: 'inner-council',
    tags: ['council', 'advisor', 'selection', 'choosing'],
    content: `Each Inner Council advisor has distinct expertise. Choosing the right one leads to more useful advice.

**Quick Selection Guide**

| Your Question About | Best Advisor |
|---------------------|--------------|
| "Does this meet standards?" | Standards Guardian |
| "How do I support this learner?" | Differentiation Architect |
| "How should I assess this?" | Assessment Designer |
| "How does this fit the big picture?" | Curriculum Strategist |

**Choose Standards Guardian When:**
- Mapping lessons to specific standards
- Checking unit coverage completeness
- Writing standards-aligned objectives
- Preparing for curriculum audits

**Choose Differentiation Architect When:**
- Planning for specific student needs
- Implementing IEP or 504 accommodations
- Supporting English learners
- Creating accessible materials

**Choose Assessment Designer When:**
- Creating quizzes or tests
- Writing rubric criteria
- Planning formative checks
- Designing feedback strategies

**Choose Curriculum Strategist When:**
- Planning units or semesters
- Deciding what to teach when
- Finding cross-curricular connections
- Balancing content coverage

**When Multiple Advisors Apply**

Start with one, then consult another:
1. "Does my forces unit cover standards?" → Standards Guardian
2. "How should I assess those standards?" → Assessment Designer

Or get multiple perspectives by asking the same question to different advisors.`,
    relatedArticles: ['inner-council-intro', 'interpreting-advice'],
  },
  {
    id: 'interpreting-advice',
    title: 'Interpreting Advisory Feedback',
    category: 'inner-council',
    tags: ['council', 'advice', 'feedback', 'interpretation'],
    content: `Inner Council advisors provide structured recommendations. Here's how to use them effectively.

**Response Structure**

Each advisor response includes:
1. **Direct Answer** - The main response to your question
2. **Reasoning** - Why this recommendation
3. **Suggested Actions** - Specific next steps
4. **Citations** - References to your uploaded sources
5. **Considerations** - Caveats or additional factors

**The Teacher Authority Filter**

Every recommendation should pass through your professional judgment:
- Does this fit my students? (You know them; the AI doesn't)
- Does this fit my context? (School culture, resources, time)
- Does this fit my expertise? (Your teaching style)
- Does this feel right? (Trust your instincts)

**When Advice Doesn't Fit**

**Push back:**
"That won't work because my students don't have lab equipment. What alternatives could I use?"

**Request adjustment:**
"I need a shorter activity. Can you suggest a 15-minute version?"

**Take what's useful:**
Use the parts that work, discard what doesn't.

**Confidence Language to Notice**

- **High**: "The standard explicitly requires..."
- **Moderate**: "This approach typically supports..."
- **Lower**: "One possible approach might be..."

**Building on Feedback**

Follow-up questions work well:
- Initial: "Does my lesson align with standards?"
- Follow-up: "You mentioned MS-PS2-2 is partially covered. What would strengthen it?"
- Follow-up: "How could I assess that addition formatively?"`,
    relatedArticles: ['inner-council-intro', 'choosing-advisors'],
  },

  // ============================================
  // NARRATIVE SYNTHESIS (3 articles)
  // ============================================
  {
    id: 'narrative-overview',
    title: 'Narrative Comment Synthesis',
    category: 'narratives',
    tags: ['narrative', 'report card', 'comments', 'feedback', 'synthesis'],
    content: `TeachAssist helps you draft report card comments and narrative feedback.

**What Narrative Synthesis Does**

Generates draft comments based on:
- Criteria you specify (standards, rubric levels)
- Achievement data you enter (anonymized)
- Your uploaded curriculum materials

**Does NOT:**
- Grade student work
- Assign scores or levels
- Make final judgments
- Replace your professional assessment

**How It Works**

1. You select criteria (e.g., IB MYP descriptors, state standards)
2. You enter achievement data (using FERPA-safe methods)
3. TeachAssist generates a draft comment
4. You review and edit to match your voice
5. You use the final comment in your report card system

**Important Boundaries**

TeachAssist is a **draft writer**, not a grader.

**Grading (TeachAssist will NOT do):**
- Looking at student work and assigning a score
- Deciding achievement levels
- Evaluating quality of student output

**Draft Writing (TeachAssist DOES):**
- Taking YOUR assessment data and generating prose
- Synthesizing criteria descriptors into readable comments
- Creating starting points for you to refine

**Example Workflow**

1. Upload IB MYP Science criteria document
2. Enter: Student_A, Criterion A: 5, B: 6, C: 4, D: 5
3. Generate draft
4. Review and personalize (add specific examples)
5. Use edited comment in your report card system`,
    relatedArticles: ['entering-student-data', 'reviewing-narratives'],
  },
  {
    id: 'entering-student-data',
    title: 'Entering Student Data (FERPA-safe)',
    category: 'narratives',
    tags: ['student data', 'ferpa', 'privacy', 'anonymous', 'data entry'],
    content: `TeachAssist generates narrative comments while protecting student privacy.

**The Privacy-First Approach**

TeachAssist uses a de-identified data model:
- No student names required
- No persistent student records
- Data exists only for the current session
- You maintain identifying information separately

**How to Enter Data**

**Step 1: Use Anonymous Identifiers**

Recommended:
- Student_A, Student_B
- Learner_1, Learner_2
- Your own ID system

Do NOT use:
- Full names
- First names alone
- Initials with other identifying info

**Step 2: Enter Achievement Levels**

Numerical: Criterion A: 5, Criterion B: 6
Descriptor: Criterion A: Developing, Criterion B: Proficient

**Step 3: Add Context (Optional)**

Safe: "Strong in lab work", "Needs support with written expression"
Avoid: Names of other students, specific medical info

**Example Data Entry**

\`\`\`
Student ID: Student_A
Term: Term 2
Criterion A (Knowing): 6
Criterion B (Inquiring): 5
Criterion C (Processing): 4
Criterion D (Reflecting): 5
Notes: Strong conceptual understanding, needs support with data analysis
\`\`\`

**Your Responsibility**

- Never enter student names in any field
- Use anonymous identifiers consistently
- Keep your mapping (ID = student) secure and separate
- Review generated comments before using them`,
    relatedArticles: ['narrative-overview', 'privacy-first'],
  },
  {
    id: 'reviewing-narratives',
    title: 'Reviewing and Editing Narratives',
    category: 'narratives',
    tags: ['review', 'edit', 'personalize', 'narratives', 'comments'],
    content: `AI-generated narrative drafts are starting points. Your review transforms them into authentic comments.

**The Review Process**

**Step 1: Read the Full Draft**
- Does it capture the overall picture?
- Does the tone feel appropriate?
- Any obvious errors?

**Step 2: Check Accuracy**
- Do achievement descriptions match levels?
- Is each criterion addressed?
- Are strengths and growth areas correct?

**Step 3: Add Personalization**

Generic: "Shows strong inquiry skills"
Personalized: "Shows strong inquiry skills, particularly evident in the ecosystem investigation where she developed and tested three hypotheses"

**Step 4: Verify Appropriateness**
- Tone: Professional, supportive, growth-oriented?
- Balance: Strengths and growth areas?
- Length: Meets school expectations?

**Common Edits**

**Strengthening weak phrases:**
Before: "The student did well"
After: "Demonstrates consistent strength in experimental design"

**Adding specificity:**
Before: "Needs to improve"
After: "Developing data analysis skills, particularly interpreting graphs"

**Making growth-oriented:**
Before: "Struggled with calculations"
After: "Building calculation skills with step-by-step scaffolds"

**Final Checklist**

- [ ] Achievement descriptions match data
- [ ] All criteria addressed
- [ ] At least one specific example
- [ ] Growth areas phrased constructively
- [ ] Tone matches your style
- [ ] Length meets expectations
- [ ] Proofread for clarity`,
    relatedArticles: ['narrative-overview', 'entering-student-data'],
  },

  // ============================================
  // REFERENCE (2 articles)
  // ============================================
  {
    id: 'ib-criteria',
    title: 'IB MYP Science Criteria Reference',
    category: 'reference',
    tags: ['ib', 'myp', 'science', 'criteria', 'assessment', 'reference'],
    content: `Quick reference for IB MYP Sciences assessment criteria.

**The Four Criteria**

| Criterion | Name | Focus |
|-----------|------|-------|
| A | Knowing and understanding | Scientific knowledge |
| B | Inquiring and designing | Investigation design |
| C | Processing and evaluating | Data handling |
| D | Reflecting on impacts | Scientific literacy |

**Criterion A: Knowing and Understanding**
Assesses: Knowledge of facts, understanding theories, application of concepts, scientific communication
Levels 1-2: Limited knowledge, struggles to apply
Levels 3-4: Basic knowledge, applies with support
Levels 5-6: Good knowledge, applies independently
Levels 7-8: Excellent knowledge, transfers effectively

**Criterion B: Inquiring and Designing**
Assesses: Hypotheses, investigation design, variables, methods
Key words: hypothesizes, designs, investigates, identifies variables

**Criterion C: Processing and Evaluating**
Assesses: Data collection, presentation, analysis, evaluation
Key words: collects, organizes, analyzes, interprets, evaluates

**Criterion D: Reflecting on Impacts**
Assesses: Science-society connections, implications, real-world application
Key words: reflects, evaluates, considers, analyzes impacts

**Using with TeachAssist**

For narrative synthesis:
\`\`\`
Criterion A: [Level 1-8]
Criterion B: [Level 1-8]
Criterion C: [Level 1-8]
Criterion D: [Level 1-8]
\`\`\`

The generated narrative will describe achievement at each level and suggest growth areas.

**Example Input & Output**

Input: A: 6, B: 7, C: 4, D: 5

Output: "This student demonstrates strong scientific knowledge (Criterion A), applying concepts effectively. They show excellent inquiry skills (Criterion B), designing rigorous investigations. Data processing (Criterion C) is a growth area, particularly analysis and conclusions..."`,
    relatedArticles: ['narrative-overview', 'entering-student-data'],
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    category: 'reference',
    tags: ['keyboard', 'shortcuts', 'hotkeys', 'navigation', 'quick'],
    content: `Work faster in TeachAssist with keyboard shortcuts.

**Global Navigation**

| Shortcut | Action |
|----------|--------|
| \`Cmd+K\` | Open Command Palette |
| \`Cmd+J\` | Toggle Chat Panel |
| \`Cmd+/\` | Toggle Help Center |
| \`Cmd+.\` | Toggle AI Assistant |
| \`Escape\` | Close any panel |

**Chat Shortcuts**

| Shortcut | Action |
|----------|--------|
| \`Enter\` | Send message |
| \`Shift+Enter\` | New line |
| \`Cmd+L\` | Clear chat history |
| \`Up Arrow\` | Edit last message |

**Sources & Upload**

| Shortcut | Action |
|----------|--------|
| \`Cmd+U\` | Upload new document |
| \`Cmd+S\` | Search sources |
| \`Cmd+F\` | Find in current source |

**Inner Council**

| Shortcut | Action |
|----------|--------|
| \`Cmd+1\` | Standards Guardian |
| \`Cmd+2\` | Differentiation Architect |
| \`Cmd+3\` | Assessment Designer |
| \`Cmd+4\` | Curriculum Strategist |

**Narrative Synthesis**

| Shortcut | Action |
|----------|--------|
| \`Cmd+G\` | Generate narrative draft |
| \`Cmd+C\` | Copy current draft |
| \`Cmd+R\` | Regenerate with same data |

**Settings**

| Shortcut | Action |
|----------|--------|
| \`Cmd+,\` | Open Settings |
| \`Cmd+T\` | Toggle theme (light/dark) |

**Quick Reference Card**

Most Used:
- \`Cmd+K\` - Command Palette (do anything)
- \`Cmd+J\` - Chat
- \`Cmd+/\` - Help
- \`Cmd+U\` - Upload

Master these three first: \`Cmd+K\`, \`Cmd+J\`, \`Cmd+/\``,
    relatedArticles: ['quick-start', 'welcome'],
  },
]

// Helper function to get articles by category
export function getArticlesByCategory(categoryId: string): HelpArticle[] {
  return HELP_ARTICLES.filter(article => article.category === categoryId)
}

// Helper function to search articles
export function searchArticles(query: string): HelpArticle[] {
  const lowerQuery = query.toLowerCase()
  return HELP_ARTICLES.filter(article =>
    article.title.toLowerCase().includes(lowerQuery) ||
    article.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    article.content.toLowerCase().includes(lowerQuery)
  )
}

// Helper function to get an article by id
export function getArticleById(id: string): HelpArticle | undefined {
  return HELP_ARTICLES.find(article => article.id === id)
}
