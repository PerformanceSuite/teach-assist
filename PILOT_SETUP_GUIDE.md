# 🎓 TeachAssist v0.1 - Pilot Teacher Setup Guide

**Welcome to TeachAssist!** This guide will help you get up and running in about 15 minutes.

---

## 📋 What You'll Need

Before starting, make sure you have:

- ✅ A Mac or Windows computer
- ✅ Admin access to install software
- ✅ An Anthropic API key ([get one here](https://console.anthropic.com/))
- ✅ About 15 minutes of setup time
- ✅ Curriculum documents you'd like to work with (PDFs, Word docs, or text files)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Prerequisites (5 minutes)
### Step 2: Start TeachAssist (2 minutes)
### Step 3: Upload Your First Document (2 minutes)

Let's go through each step in detail!

---

## Step 1: Install Prerequisites

### A. Install Python 3.11+ (if not already installed)

**Mac:**
```bash
# Open Terminal (Cmd+Space, type "Terminal")
# Check if Python is installed:
python3 --version

# If you see "Python 3.11" or higher, you're good!
# If not, install using Homebrew:
brew install python@3.11
```

**Windows:**
1. Download Python from [python.org/downloads](https://www.python.org/downloads/)
2. Run the installer
3. ⚠️ **Important:** Check "Add Python to PATH" during installation
4. Click "Install Now"

**Verify Installation:**
```bash
# Open Terminal (Mac) or Command Prompt (Windows)
python3 --version
# Should show: Python 3.11.x or higher
```

---

### B. Install Node.js 18+ (for the web interface)

**Mac:**
```bash
# Using Homebrew (recommended):
brew install node

# Or download from nodejs.org
```

**Windows:**
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer (choose "LTS" version)
3. Accept all defaults

**Verify Installation:**
```bash
node --version
# Should show: v18.x.x or higher

npm --version
# Should show: 9.x.x or higher
```

---

### C. Get Your Anthropic API Key

TeachAssist uses Claude AI to power grounded Q&A and the Inner Council.

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-...`)
6. **Keep this key secret!** You'll need it in Step 2.

💡 **Cost Note:** API usage is pay-as-you-go. For pilot testing, expect $5-20/month depending on usage.

---

## Step 2: Start TeachAssist

### A. Download TeachAssist

**Option 1: Git Clone (if you have Git)**
```bash
# Open Terminal
cd ~/Documents  # Or wherever you keep projects
git clone https://github.com/PerformanceSuite/teach-assist.git
cd teach-assist
```

**Option 2: Download ZIP**
1. Go to [github.com/PerformanceSuite/teach-assist](https://github.com/PerformanceSuite/teach-assist)
2. Click green "Code" button → "Download ZIP"
3. Extract the ZIP file to your Documents folder
4. Open Terminal and navigate to the folder:
   ```bash
   cd ~/Documents/teach-assist-main
   ```

---

### B. Set Up the Backend (Python API)

```bash
# Navigate to backend folder
cd backend

# Create a virtual environment (keeps Python packages isolated)
python3 -m venv .venv

# Activate the virtual environment
# Mac/Linux:
source .venv/bin/activate

# Windows:
.venv\Scripts\activate

# You should see (.venv) at the start of your terminal prompt

# Install Python dependencies (takes 1-2 minutes)
pip install -r requirements.txt
```

---

### C. Configure Your API Key

```bash
# Still in the backend folder, create a .env file
# Mac/Linux:
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your_api_key_here
LOG_LEVEL=INFO
EOF

# Windows (use a text editor):
# Create a file named ".env" in the backend folder with these contents:
# ANTHROPIC_API_KEY=your_api_key_here
# LOG_LEVEL=INFO
```

**Replace `your_api_key_here` with your actual Anthropic API key!**

To edit the file:
```bash
# Mac:
nano .env
# (Ctrl+O to save, Ctrl+X to exit)

# Windows:
notepad .env
```

---

### D. Start the Backend Server

```bash
# Still in the backend folder with .venv activated
uvicorn api.main:app --reload --port 8002

# You should see:
# INFO:     Uvicorn running on http://127.0.0.1:8002
# INFO:     Application startup complete.
```

✅ **Success!** Your backend is running. Keep this terminal window open.

---

### E. Set Up the Frontend (Web Interface)

Open a **new terminal window** (keep the backend running):

```bash
# Navigate to the TeachAssist folder (not the backend subfolder)
cd ~/Documents/teach-assist  # Adjust path if needed

# Install JavaScript dependencies (takes 2-3 minutes)
npm install

# Create frontend configuration
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8002
EOF

# Windows: Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8002
```

---

### F. Start the Frontend Server

```bash
# In the main teach-assist folder (not backend)
npm run dev

# You should see:
# ✓ Ready in 1.3s
# ○ Local:   http://localhost:3000
```

✅ **Success!** Your frontend is running.

---

### G. Open TeachAssist in Your Browser

1. Open your web browser (Chrome, Safari, Firefox, Edge)
2. Go to: **http://localhost:3000**
3. You should see the TeachAssist Welcome Dashboard!

🎉 **You're ready to use TeachAssist!**

---

## Step 3: Upload Your First Document

### A. Navigate to Sources

1. On the Welcome Dashboard, click **"Upload Curriculum Sources"**
   - Or use keyboard shortcut: **Cmd+U** (Mac) or **Ctrl+U** (Windows)
2. You'll see the Sources page with an upload area

---

### B. Upload a Document

1. Click the upload area or drag a file
2. Supported formats:
   - PDF (curriculum guides, textbooks)
   - DOCX (lesson plans, unit plans)
   - TXT (standards documents)
3. Add a descriptive title (e.g., "9th Grade Physics Standards")
4. Click "Upload"

⏱️ **Upload time:** 5-30 seconds depending on file size

---

### C. Verify Your Upload

After upload, you should see:
- ✅ Document appears in the sources list
- ✅ Shows filename, upload date, and number of "chunks" (sections)
- ✅ Status: "indexed" (ready for questions)

---

### D. Ask Your First Question

1. Click **"Ask a Question"** from the Welcome Dashboard
   - Or use keyboard shortcut: **Cmd+J** (Mac) or **Ctrl+J** (Windows)
2. Type a question about your uploaded document
   - Example: "What are the main standards for forces and motion?"
3. Press Enter or click "Send"

🤖 **TeachAssist will:**
- Search your uploaded documents
- Find relevant passages
- Generate a grounded answer using Claude AI
- Show citations so you can verify the source

---

## 🎯 Quick Feature Tour

### 1. Welcome Dashboard (Home)

**What it is:** Your starting point each time you open TeachAssist

**Quick Actions:**
- Upload Curriculum Sources
- Ask a Question
- Consult Inner Council
- Browse Sources
- View Help Documentation

**Recent Activity:**
- See your recent uploads and conversations

---

### 2. Sources (Document Management)

**What it is:** Upload, organize, and manage your curriculum materials

**Features:**
- Upload PDFs, DOCX, TXT files
- See all uploaded documents
- View document details (chunks, upload date)
- Delete documents you no longer need

**Keyboard Shortcut:** Cmd+U (Mac) or Ctrl+U (Windows)

---

### 3. Chat (Grounded Q&A)

**What it is:** Ask questions about your uploaded sources and get grounded answers

**How it works:**
1. Type your question
2. TeachAssist searches your documents
3. Claude AI generates an answer based on your sources
4. You see citations showing where the answer came from

**Best practices:**
- Be specific in your questions
- Ask about topics covered in your uploaded documents
- Use follow-up questions to dive deeper

**Keyboard Shortcut:** Cmd+J (Mac) or Ctrl+J (Windows)

---

### 4. Inner Council (AI Advisors)

**What it is:** Four specialized AI advisors who provide structured feedback

**The Council:**

**📚 Standards Guardian**
- Expertise: Curriculum alignment, standards mapping
- Use when: Planning lessons, checking standards coverage
- Example: "Am I meeting NGSS standards with this forces unit?"

**🎯 Differentiation Advocate**
- Expertise: Equity, accessibility, differentiation
- Use when: Planning for diverse learners
- Example: "How can I differentiate this lesson for ELL students?"

**🏃 Practical Realist**
- Expertise: Time management, feasibility, logistics
- Use when: Evaluating lesson plans, managing workload
- Example: "Is this unit realistic for 2 weeks with my schedule?"

**📊 Assessment Architect**
- Expertise: Assessment design, rubrics, feedback
- Use when: Creating assessments, designing rubrics
- Example: "How should I assess student understanding of Newton's Laws?"

**How to consult:**
1. Choose an advisor (or select multiple)
2. Describe your context (lesson, unit, grade level)
3. Ask your question
4. Receive structured advice:
   - **Observations:** What the advisor notices
   - **Risks:** Potential issues to watch for
   - **Suggestions:** Actionable recommendations
   - **Questions:** Reflection prompts for you

**Keyboard Shortcut:** Cmd+Shift+C (Mac) or Ctrl+Shift+C (Windows)

---

### 5. AI Assistant (Contextual Help)

**What it is:** Proactive suggestions based on where you are in TeachAssist

**How to access:**
- Keyboard: **Cmd+.** (Mac) or **Ctrl+.** (Windows)
- Appears as a sidebar on the right

**What it shows:**
- Suggestions for what to do next
- Tips relevant to your current page
- Quick actions and shortcuts
- Reminders about uploaded documents

**Example suggestions:**
- On Home: "Upload your curriculum standards"
- On Sources: "Try organizing documents by unit"
- On Chat: "Ask about standards alignment"

---

### 6. Help Center (Documentation)

**What it is:** Searchable documentation with 16 teacher-specific articles

**How to access:**
- Keyboard: **Cmd+/** (Mac) or **Ctrl+/** (Windows)
- Click Help button in navigation

**Categories:**
- Getting Started (4 articles)
- Knowledge Base / Sources (3 articles)
- Inner Council (3 articles)
- Grading (3 articles - future features)
- Privacy & Ethics (3 articles)

**Features:**
- Search across all articles
- Browse by category
- Track articles you've read
- Related articles for deeper learning

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| **Cmd+K** / Ctrl+K | Command Palette (coming soon) |
| **Cmd+J** / Ctrl+J | Go to Chat |
| **Cmd+U** / Ctrl+U | Upload Source |
| **Cmd+Shift+C** / Ctrl+Shift+C | Go to Inner Council |
| **Cmd+.** / Ctrl+. | Toggle AI Assistant |
| **Cmd+/** / Ctrl+/ | Toggle Help Center |
| **Cmd+1** / Ctrl+1 | Go to Home |
| **Cmd+2** / Ctrl+2 | Go to Sources |
| **Cmd+3** / Ctrl+3 | Go to Chat |
| **Cmd+4** / Ctrl+4 | Go to Inner Council |
| **Cmd+0** / Ctrl+0 | Return to Welcome Dashboard |
| **Esc** | Close open panel (AI Assistant or Help) |

💡 **Pro tip:** Press Cmd+/ anytime to open Help and see all shortcuts!

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Fix:**
```bash
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

---

**Error:** `Address already in use (port 8002)`

**Fix:**
```bash
# Mac/Linux:
lsof -ti:8002 | xargs kill -9

# Windows:
netstat -ano | findstr :8002
taskkill /PID <PID_NUMBER> /F
```

---

**Error:** `ANTHROPIC_API_KEY not configured`

**Fix:**
1. Check that `.env` file exists in `backend` folder
2. Verify your API key is correct (starts with `sk-ant-`)
3. Make sure there are no spaces around the `=` sign
4. Restart the backend server

---

### Frontend won't start

**Error:** `npm: command not found`

**Fix:** Install Node.js (see Step 1B above)

---

**Error:** `Port 3000 is already in use`

**Fix:** Next.js will automatically use port 3001. Check the terminal output for the actual URL.

---

**Error:** Frontend loads but can't connect to backend

**Fix:**
1. Check backend is running (visit http://localhost:8002/health in browser)
2. Should see: `{"status":"healthy",...}`
3. Check `.env.local` in main folder has: `NEXT_PUBLIC_API_URL=http://localhost:8002`
4. Restart frontend: Ctrl+C in terminal, then `npm run dev` again

---

### Document upload fails

**Error:** "Upload failed" or no response

**Possible causes:**
1. Backend not running → Check http://localhost:8002/health
2. File too large → Try files under 10MB for pilot
3. Unsupported format → Use PDF, DOCX, or TXT

**Check backend logs:**
```bash
# In the backend terminal window, look for error messages
# Common issues:
# - PDF parsing errors
# - Memory issues with large files
```

---

### Chat doesn't return answers

**Issue:** Chat loads forever or returns generic responses

**Possible causes:**
1. No documents uploaded → Upload at least one document first
2. API key invalid → Check `.env` file in backend folder
3. Question not related to uploaded content → Try a question about something in your documents

**Test your API key:**
```bash
# In backend folder with .venv activated
python3 << 'EOF'
import os
from anthropic import Anthropic

api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    print("❌ API key not found in environment")
else:
    print(f"✅ API key loaded: {api_key[:15]}...")
    try:
        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=100,
            messages=[{"role": "user", "content": "Hello"}]
        )
        print("✅ API key is valid!")
    except Exception as e:
        print(f"❌ API error: {e}")
EOF
```

---

### Inner Council gives errors

**Error:** 422 validation error

**Possible cause:** API format mismatch (this is a known issue if you see it)

**Workaround:**
1. Make sure you select at least one advisor
2. Fill in all fields (context type, content, question)
3. If issue persists, check for updates to TeachAssist

---

## 🔒 Privacy & Security

### What data does TeachAssist store?

**Locally (on your computer):**
- ✅ Uploaded documents (in `backend/data/` folder)
- ✅ Document embeddings (for search)
- ✅ Browser preferences (Help Center viewed articles)

**Not stored:**
- ❌ Your conversations (not persisted in v0.1)
- ❌ API keys (stay in `.env` file, never transmitted)

**Sent to Anthropic API:**
- ✅ Your questions + relevant document excerpts
- ✅ Inner Council consultation requests

**Never sent anywhere:**
- ❌ Your complete documents
- ❌ Student names or grades
- ❌ Personal information

---

### Best Practices

**✅ DO:**
- Upload curriculum standards, textbooks, lesson plans
- Upload your own teaching materials
- Ask questions about content and pedagogy

**❌ DON'T:**
- Upload student work (violates FERPA)
- Upload documents with student PII (names, IDs)
- Share your API key with anyone
- Commit the `.env` file to version control

---

## 💰 Cost Management

### How much does TeachAssist cost?

**Software:** Free (open source)

**API Usage:** Pay-as-you-go to Anthropic
- **Claude Sonnet 4:** ~$3 per million input tokens, ~$15 per million output tokens
- **Typical pilot usage:** $5-20/month
- **Heavy usage:** $30-50/month

### Estimate your costs:

**Typical usage:**
- 10 questions/day × 1,000 tokens each = 10k tokens/day
- 30 days × 10k = 300k tokens/month
- 300k tokens × $3/million = **~$1/month** (input)
- Output is ~2x more expensive, so **~$3-5/month total**

**Monitor your usage:**
- Check [console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage)
- Set up usage limits in Anthropic dashboard
- You'll get email alerts if approaching limits

---

## 🎓 Pilot Feedback

### What we're looking for:

**As a pilot teacher, your feedback is invaluable!** Please share:

1. **What works well?**
   - Which features save you time?
   - Which Inner Council advisors are most helpful?
   - What questions do you ask most often?

2. **What's confusing?**
   - Any features that don't make sense?
   - Setup steps that were unclear?
   - UI elements that are hard to find?

3. **What's missing?**
   - Features you wish existed?
   - Keyboard shortcuts you'd use?
   - Help articles that would be useful?

4. **Inner Council feedback:**
   - Are the advisor responses helpful?
   - Do you trust the advice?
   - Would you want more/different advisors?

---

### How to share feedback:

**Option 1: GitHub Issues**
- Go to [github.com/PerformanceSuite/teach-assist/issues](https://github.com/PerformanceSuite/teach-assist/issues)
- Click "New Issue"
- Use the "Pilot Feedback" template

**Option 2: Email**
- Send to: [your-pilot-feedback-email]
- Include:
  - Your name (optional)
  - School/grade level
  - What you were trying to do
  - What happened (screenshots welcome!)

**Option 3: Weekly Check-in**
- We'll schedule a 15-minute call each week
- Share your experience, ask questions
- Demo any issues you encountered

---

## 📚 Additional Resources

### Documentation

- **Full documentation:** `docs/` folder in TeachAssist
- **API reference:** `docs/API_CLIENT.md`
- **Help articles:** Access via Cmd+/ in the app

### Sample Workflows

**Workflow 1: Planning a new unit**
1. Upload curriculum standards (PDF)
2. Upload textbook chapter (PDF)
3. Chat: "What are the key learning objectives?"
4. Consult Standards Guardian: "Am I covering all required standards?"
5. Consult Practical Realist: "Is this feasible for 2 weeks?"

**Workflow 2: Differentiating a lesson**
1. Upload lesson plan (DOCX)
2. Upload IEP accommodations (TXT)
3. Consult Differentiation Advocate: "How can I support my ELL students?"
4. Chat: "What scaffolds should I add for struggling readers?"

**Workflow 3: Creating an assessment**
1. Upload unit standards (PDF)
2. Upload lesson materials (DOCX)
3. Consult Assessment Architect: "What format best assesses understanding?"
4. Chat: "Generate 5 discussion questions about forces"

---

## 🚀 What's Next?

### Coming in v0.2 (future releases):

**Grade Studio** (Batch Grading)
- Upload student work
- AI suggests feedback drafts
- You edit and approve
- Maintain your voice and standards

**Plan Studio** (Lesson Planning)
- Upload unit goals
- AI suggests lesson sequences
- Standards alignment checking
- Resource recommendations

**Sunday Rescue Mode**
- Quick weekend planning
- Emergency lesson plans
- Sub plans generator
- Print-ready materials

---

## ✅ Setup Complete!

You're now ready to use TeachAssist for:
- ✅ Uploading curriculum documents
- ✅ Asking grounded questions
- ✅ Consulting the Inner Council
- ✅ Exploring with keyboard shortcuts
- ✅ Getting help when you need it

### Quick Start Commands

**To start TeachAssist each time:**

```bash
# Terminal 1 (Backend):
cd ~/Documents/teach-assist/backend
source .venv/bin/activate
uvicorn api.main:app --reload --port 8002

# Terminal 2 (Frontend):
cd ~/Documents/teach-assist
npm run dev

# Then open: http://localhost:3000
```

💡 **Pro tip:** Create a startup script to make this easier! (See Appendix A)

---

## Appendix A: Startup Script

### Mac/Linux

Create a file `start-teachassist.sh`:

```bash
#!/bin/bash

# Start TeachAssist
echo "Starting TeachAssist..."

# Start backend in background
cd ~/Documents/teach-assist/backend
source .venv/bin/activate
uvicorn api.main:app --reload --port 8002 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Start frontend in background
cd ~/Documents/teach-assist
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "TeachAssist is starting..."
echo "Backend: http://localhost:8002"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
```

Make it executable:
```bash
chmod +x start-teachassist.sh
```

Run it:
```bash
./start-teachassist.sh
```

---

### Windows

Create a file `start-teachassist.bat`:

```batch
@echo off
echo Starting TeachAssist...

:: Start backend
cd /d %USERPROFILE%\Documents\teach-assist\backend
start "TeachAssist Backend" cmd /k "call .venv\Scripts\activate && uvicorn api.main:app --reload --port 8002"

:: Start frontend
cd /d %USERPROFILE%\Documents\teach-assist
start "TeachAssist Frontend" cmd /k "npm run dev"

echo.
echo TeachAssist is starting...
echo Backend: http://localhost:8002
echo Frontend: http://localhost:3000
echo.
echo Close the terminal windows to stop TeachAssist
```

Double-click `start-teachassist.bat` to run.

---

## 🎉 Welcome to TeachAssist!

Thank you for being a pilot teacher. Your feedback will help shape the future of AI-assisted teaching tools.

**Questions?** Check the Help Center (Cmd+/) or reach out to the pilot program coordinators.

**Happy teaching!** 🎓

---

**Version:** v0.1 Pilot
**Last Updated:** 2026-01-25
**Documentation:** [github.com/PerformanceSuite/teach-assist](https://github.com/PerformanceSuite/teach-assist)
