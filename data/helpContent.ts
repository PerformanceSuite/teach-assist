/**
 * Help Content - Articles and categories for the Help Center (Teacher-specific)
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
    id: 'sources',
    name: 'Sources & Knowledge',
    icon: 'FileText',
    description: 'Managing your teaching materials',
  },
  {
    id: 'council',
    name: 'Inner Council',
    icon: 'Users',
    description: 'Working with AI advisors',
  },
  {
    id: 'chat',
    name: 'Grounded Chat',
    icon: 'MessageSquare',
    description: 'Getting answers from your sources',
  },
  {
    id: 'privacy',
    name: 'Privacy & Ethics',
    icon: 'Shield',
    description: 'Data protection and guardrails',
  },
  {
    id: 'shortcuts',
    name: 'Keyboard Shortcuts',
    icon: 'Keyboard',
    description: 'Quick actions and navigation',
  },
]

export const HELP_ARTICLES: HelpArticle[] = [
  // Getting Started
  {
    id: 'gs-overview',
    title: 'What is TeachAssist?',
    category: 'getting-started',
    tags: ['overview', 'introduction', 'basics'],
    content: `TeachAssist is your teaching intelligence system designed to help you work smarter, not harder.

**Key Features:**
- **Notebook Mode**: Upload curriculum sources for grounded AI assistance
- **Grounded Chat**: Ask questions with citation-backed answers
- **Inner Council**: Consult specialized AI advisors
- **Privacy First**: Your student data stays private, always

**Core Principles:**
- Teacher maintains authority over all decisions
- AI assists but never grades or makes judgments
- All answers cite your uploaded sources
- Student privacy is protected

**Getting Started:**
1. Upload curriculum standards or lesson plans
2. Ask questions about your sources
3. Consult Inner Council advisors for structured advice
4. Use keyboard shortcuts to work faster`,
    relatedArticles: ['gs-upload-first-doc', 'privacy-what-data-stored'],
  },
  {
    id: 'gs-upload-first-doc',
    title: 'Uploading Your First Document',
    category: 'getting-started',
    tags: ['upload', 'sources', 'documents', 'getting started'],
    content: `Start building your knowledge base by uploading teaching materials.

**What to Upload:**
- Curriculum standards (Common Core, state standards)
- Lesson plans and unit plans
- Teaching frameworks (UbD, 5E model)
- Student IEPs and 504 plans (anonymized)
- Professional development materials

**How to Upload:**
1. Click "Upload Sources" on the home page
2. Select a file (PDF, DOCX, TXT supported)
3. Add a title (e.g., "8th Grade Science Standards")
4. Wait for processing (usually < 30 seconds)

**Supported Formats:**
- PDF documents
- Word documents (.docx)
- Plain text files (.txt)
- Markdown files (.md)

**After Upload:**
- Documents are chunked for semantic search
- You can now ask questions about the content
- Inner Council can reference these sources`,
    relatedArticles: ['sources-organizing', 'chat-asking-questions'],
  },
  {
    id: 'gs-asking-questions',
    title: 'Asking Your First Question',
    category: 'getting-started',
    tags: ['chat', 'questions', 'grounded'],
    content: `Get grounded answers from your uploaded sources.

**How to Ask:**
1. Navigate to Chat (or press Cmd+J)
2. Type your question in the input
3. Press Enter to send

**Good Questions:**
- "What are the 8th grade force and motion standards?"
- "How does UbD suggest starting lesson planning?"
- "What accommodations does this IEP require?"

**What You Get:**
- Answers citing your uploaded sources
- Relevant excerpts highlighted
- Links to source documents
- No hallucinations or made-up information

**Tips:**
- Be specific in your questions
- Reference document names if needed
- Ask follow-up questions for clarity`,
    relatedArticles: ['chat-grounded-responses', 'sources-search'],
  },
  {
    id: 'gs-inner-council',
    title: 'Meeting Your Inner Council',
    category: 'getting-started',
    tags: ['council', 'advisors', 'personas'],
    content: `The Inner Council is your team of specialized AI advisors.

**Available Advisors:**

1. **Standards Guardian**
   - Ensures curriculum alignment
   - Reviews lesson plans for standards coverage
   - Flags gaps in instruction

2. **Differentiation Architect**
   - Suggests accommodations and modifications
   - Helps with UDL implementation
   - Supports diverse learner needs

3. **Assessment Designer**
   - Guides formative assessment creation
   - Reviews rubric alignment
   - Suggests feedback strategies

4. **Curriculum Strategist**
   - Big-picture planning advice
   - Unit coherence review
   - Scope and sequence guidance

**How to Consult:**
1. Navigate to Inner Council
2. Choose an advisor
3. Provide context (what you're working on)
4. Ask your question
5. Receive structured, role-specific advice`,
    relatedArticles: ['council-choosing-advisor', 'council-understanding-advice'],
  },

  // Sources & Knowledge
  {
    id: 'sources-organizing',
    title: 'Organizing Your Knowledge Base',
    category: 'sources',
    tags: ['organization', 'sources', 'documents'],
    content: `Keep your teaching materials organized and accessible.

**Recommended Structure:**

**Foundation Documents:**
- State/national standards
- District curriculum guides
- School policies and procedures

**Planning Materials:**
- Unit plans and lesson plans
- Teaching frameworks (UbD, 5E, etc.)
- Assessment blueprints

**Student Support:**
- IEPs and 504 plans (anonymized!)
- Differentiation strategies
- Accommodation guidelines

**Professional Growth:**
- PD materials and notes
- Research articles
- Best practices guides

**Tips:**
- Use clear, descriptive titles
- Upload related documents together
- Update outdated materials
- Remove unnecessary files`,
    relatedArticles: ['gs-upload-first-doc', 'privacy-student-data'],
  },
  {
    id: 'sources-search',
    title: 'Searching Your Sources',
    category: 'sources',
    tags: ['search', 'semantic', 'find'],
    content: `TeachAssist uses semantic search to find relevant content.

**How It Works:**
- Searches by meaning, not just keywords
- Finds related concepts automatically
- Ranks by relevance to your query

**Search Examples:**

**Keyword Search:**
"force and motion standards" → finds exact standards

**Semantic Search:**
"What do students need to know about Newton's laws?"
→ finds standards about forces, motion, and laws of motion

**Concept Search:**
"accommodations for reading struggles"
→ finds IEP modifications, dyslexia supports, etc.

**Tips:**
- Ask questions naturally
- Use complete sentences
- Be specific about grade level or subject`,
    relatedArticles: ['chat-asking-questions', 'chat-grounded-responses'],
  },
  {
    id: 'sources-privacy',
    title: 'Privacy & Student Data',
    category: 'sources',
    tags: ['privacy', 'ferpa', 'student data'],
    content: `Protecting student privacy is our highest priority.

**What's Safe to Upload:**
- Anonymized IEPs (remove student names)
- De-identified assessment data
- General accommodation strategies
- Curriculum standards
- Lesson plans without student names

**NEVER Upload:**
- Student names or photos
- Social security numbers
- Home addresses or contact info
- Medical diagnoses (unless anonymized)
- Disciplinary records

**Data Storage:**
- Files stored locally on your machine
- No cloud storage by default
- You control all deletions
- No sharing with third parties

**FERPA Compliance:**
TeachAssist helps you stay compliant by keeping data local and private.`,
    relatedArticles: ['privacy-what-data-stored', 'privacy-teacher-authority'],
  },

  // Inner Council
  {
    id: 'council-choosing-advisor',
    title: 'Choosing the Right Advisor',
    category: 'council',
    tags: ['council', 'advisors', 'choosing'],
    content: `Each Inner Council advisor has specific expertise.

**When to Consult Each Advisor:**

**Standards Guardian:**
- Checking standards alignment
- Reviewing scope and sequence
- Ensuring curriculum coverage
- Planning assessments

**Differentiation Architect:**
- Implementing accommodations
- UDL planning
- Supporting diverse learners
- Modifying assignments

**Assessment Designer:**
- Creating rubrics
- Designing formative assessments
- Planning feedback strategies
- Evaluating student understanding

**Curriculum Strategist:**
- Big-picture planning
- Unit design
- Pacing guides
- Cross-curricular connections

**Best Practice:**
Start with one advisor, then consult others for different perspectives.`,
    relatedArticles: ['council-understanding-advice', 'gs-inner-council'],
  },
  {
    id: 'council-understanding-advice',
    title: 'Understanding Council Advice',
    category: 'council',
    tags: ['council', 'advice', 'interpretation'],
    content: `Inner Council advice is structured and actionable.

**Response Format:**
Each advisor provides:
- Direct answer to your question
- Supporting reasoning
- Suggested next steps
- Citations from your sources (if applicable)

**How to Use Advice:**
1. **Read the full response** - Context matters
2. **Check citations** - Verify against your sources
3. **Apply your judgment** - You're the expert on your students
4. **Iterate if needed** - Ask follow-up questions

**Important Reminders:**
- Advisors suggest, you decide
- Teacher authority is paramount
- AI doesn't know your students
- Trust your professional judgment

**When to Push Back:**
If advice doesn't fit your context, ask the advisor to reconsider with more specific details about your situation.`,
    relatedArticles: ['council-choosing-advisor', 'privacy-teacher-authority'],
  },
  {
    id: 'council-how-it-works',
    title: 'How the Council Works',
    category: 'council',
    tags: ['council', 'technical', 'personas'],
    content: `The Inner Council uses specialized AI personas.

**Technical Overview:**
- Each advisor has a distinct role and expertise
- Advisors have access to your uploaded sources
- Responses are grounded in your knowledge base
- No generic teacher advice - only source-based

**Persona System:**
Each advisor is defined by:
- Role and expertise area
- Decision-making principles
- Communication style
- Types of questions to handle

**Quality Assurance:**
- Advisors cite sources when possible
- Acknowledge uncertainty when appropriate
- Stay within their expertise
- Defer to teacher judgment

**Limitations:**
- Cannot make decisions for you
- Cannot grade student work
- Cannot know your specific students
- Cannot replace professional judgment`,
    relatedArticles: ['council-choosing-advisor', 'privacy-teacher-authority'],
  },

  // Chat & Grounded Responses
  {
    id: 'chat-asking-questions',
    title: 'Asking Effective Questions',
    category: 'chat',
    tags: ['chat', 'questions', 'prompts'],
    content: `Get better answers by asking better questions.

**Question Types:**

**Factual Questions:**
"What are the 8th grade standards for force and motion?"
→ Direct retrieval from uploaded standards

**Comparison Questions:**
"How does my lesson plan align with the standards?"
→ Compares documents in your knowledge base

**Planning Questions:**
"What should I cover in a unit on Newton's laws?"
→ Synthesizes from curriculum guides

**Support Questions:**
"What accommodations are recommended for dyslexia?"
→ Pulls from uploaded IEPs or support docs

**Tips for Better Questions:**
- Be specific about grade level and subject
- Reference document names if needed
- Ask one question at a time
- Provide context for complex questions`,
    relatedArticles: ['chat-grounded-responses', 'sources-search'],
  },
  {
    id: 'chat-grounded-responses',
    title: 'Understanding Grounded Responses',
    category: 'chat',
    tags: ['grounded', 'citations', 'sources'],
    content: `All TeachAssist answers cite your uploaded sources.

**What "Grounded" Means:**
- Every claim cites a specific source
- Relevant excerpts are highlighted
- No information from outside your knowledge base
- No hallucinations or made-up facts

**Response Format:**
Each answer includes:
1. Direct answer to your question
2. Supporting evidence from sources
3. Citations with document names
4. Relevant excerpts (when applicable)

**When Sources Don't Have the Answer:**
TeachAssist will say "I don't have information about this in your uploaded sources" rather than making things up.

**Tips:**
- Click citations to see full context
- Upload more sources for broader coverage
- Ask follow-up questions for clarity`,
    relatedArticles: ['chat-asking-questions', 'sources-organizing'],
  },

  // Privacy & Ethics
  {
    id: 'privacy-what-data-stored',
    title: 'What Data Does TeachAssist Store?',
    category: 'privacy',
    tags: ['privacy', 'data', 'storage', 'ferpa'],
    content: `TeachAssist prioritizes transparency and data minimization.

**What We Store:**

**On Your Local Machine:**
- Uploaded documents (PDFs, DOCX)
- Document embeddings (for semantic search)
- Chat history
- Council consultation history

**Session Data:**
- Current page/route
- UI preferences
- Keyboard shortcut settings

**What We DON'T Store:**
- Student names or identifiers
- Student grades or scores
- Assessment results
- Personal student information

**Data Location:**
- All data stored locally in TeachAssist directory
- No cloud uploads by default
- You control all deletions
- No third-party sharing

**FERPA Compliance:**
TeachAssist is designed for local use to maintain FERPA compliance. Your data stays on your machine.`,
    relatedArticles: ['privacy-student-privacy', 'sources-privacy'],
  },
  {
    id: 'privacy-student-privacy',
    title: 'Student Privacy Protections',
    category: 'privacy',
    tags: ['privacy', 'students', 'ferpa', 'protection'],
    content: `TeachAssist has built-in guardrails to protect student privacy.

**Core Protection: No Grading**
TeachAssist NEVER:
- Grades student assignments
- Assigns scores or letter grades
- Makes judgments about student ability
- Replaces teacher evaluation

**What TeachAssist CAN Do:**
- Draft feedback comments (teacher reviews/edits)
- Suggest rubric criteria
- Identify standards alignment
- Provide differentiation ideas

**Anonymization Guidelines:**
Before uploading IEPs or student plans:
1. Remove student names
2. Remove dates of birth
3. Remove addresses
4. Use generic labels: "Student A", "Learner 1"

**Best Practices:**
- Never upload grade books
- Anonymize all student references
- Keep sensitive docs in separate folder
- Review before uploading`,
    relatedArticles: ['privacy-what-data-stored', 'privacy-teacher-authority'],
  },
  {
    id: 'privacy-teacher-authority',
    title: 'Teacher Authority Principles',
    category: 'privacy',
    tags: ['ethics', 'authority', 'teacher', 'ai'],
    content: `TeachAssist augments teacher judgment, never replaces it.

**Teacher Authority:**
- You make ALL final decisions
- AI provides suggestions, not mandates
- Professional judgment is paramount
- You know your students best

**AI Boundaries:**
TeachAssist will NEVER:
- Make decisions about student placement
- Assign final grades
- Recommend discipline actions
- Replace human judgment

**AI Assistance:**
TeachAssist CAN:
- Suggest teaching strategies
- Identify standards alignment
- Draft feedback (you review/edit)
- Provide differentiation ideas

**The Rule:**
If you're uncomfortable with a suggestion, trust your instincts. You're the professional educator - the AI is your assistant, not your supervisor.

**Ethical Use:**
- Always review AI suggestions critically
- Don't blindly copy AI-generated feedback
- Maintain your teaching voice
- Put student needs first`,
    relatedArticles: ['privacy-student-privacy', 'council-understanding-advice'],
  },

  // Keyboard Shortcuts
  {
    id: 'shortcuts-global',
    title: 'Global Shortcuts',
    category: 'shortcuts',
    tags: ['keyboard', 'shortcuts', 'hotkeys'],
    content: `Work faster with keyboard shortcuts.

**Navigation:**
- \`Cmd+K\` / \`Ctrl+K\`: Command Palette
- \`Cmd+J\` / \`Ctrl+J\`: Toggle Chat
- \`Cmd+/\` / \`Ctrl+/\`: Help Center (this panel!)
- \`Cmd+.\` / \`Ctrl+.\`: AI Assistant

**Chat:**
- \`Enter\`: Send message
- \`Shift+Enter\`: New line
- \`Cmd+L\`: Clear chat

**Sources:**
- \`Cmd+U\`: Upload document
- \`Cmd+S\`: Search sources

**Council:**
- \`Cmd+1-4\`: Quick select advisor

**General:**
- \`Escape\`: Close panels/modals
- \`Cmd+,\`: Settings`,
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
