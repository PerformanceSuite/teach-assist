# TeachAssist Worktree Setup Guide

This guide explains how to set up and use git worktrees for parallel development on TeachAssist.

## Why Worktrees?

Worktrees allow you to:
- Work on backend and frontend simultaneously in separate directories
- Keep feature branches isolated
- Avoid context switching with git stash/checkout
- Run both services at once for integration testing

## Prerequisites

1. Git 2.5+ (for worktree support)
2. TeachAssist repo initialized with git

## Initial Setup

### 1. Initialize the Main Repository

```bash
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle

# Initialize git if not already done
git init
git branch -M main

# Add remote
git remote add origin https://github.com/PerformanceSuite/teach-assist.git

# Initial commit
git add -A
git commit -m "TeachAssist v0.1 scaffold with backend + personas"
git push -u origin main
```

### 2. Create Worktrees Directory

```bash
# Create sibling directory for worktrees
mkdir -p /Users/danielconnolly/Projects/TeachAssist/TeachAssist-worktrees
```

### 3. Create Feature Branch Worktrees

```bash
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle

# Backend worktree
git worktree add ../TeachAssist-worktrees/wt-backend -b feature/backend-setup

# Frontend worktree
git worktree add ../TeachAssist-worktrees/wt-frontend -b feature/frontend-integration
```

## Directory Structure After Setup

```
/Users/danielconnolly/Projects/TeachAssist/
├── TeachAssist-v0.1-bundle/     # Main repo (main branch)
│   ├── .git/                    # Git directory
│   ├── backend/
│   ├── app/
│   ├── personas/
│   └── ...
│
└── TeachAssist-worktrees/       # Worktrees directory
    ├── wt-backend/              # Backend feature branch
    │   ├── backend/             # Work here for backend
    │   └── ...
    │
    └── wt-frontend/             # Frontend feature branch
        ├── app/                 # Work here for frontend
        └── ...
```

## Daily Workflow

### Working on Backend

```bash
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-worktrees/wt-backend

# Activate virtual environment
source backend/.venv/bin/activate

# Make changes to backend/
# ...

# Commit and push
git add -A
git commit -m "feat(backend): description of changes"
git push -u origin feature/backend-setup
```

### Working on Frontend

```bash
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-worktrees/wt-frontend

# Install dependencies if needed
npm install

# Make changes to app/, components/, lib/
# ...

# Commit and push
git add -A
git commit -m "feat(frontend): description of changes"
git push -u origin feature/frontend-integration
```

### Running Both Services

Terminal 1 (Backend):
```bash
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-worktrees/wt-backend
source backend/.venv/bin/activate
cd backend
uvicorn api.main:app --reload --port 8002
```

Terminal 2 (Frontend):
```bash
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-worktrees/wt-frontend
npm run dev
```

## Creating Pull Requests

When a feature is ready:

```bash
# Backend PR
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-worktrees/wt-backend
gh pr create --base main --head feature/backend-setup \
  --title "Backend: KnowledgeBeast + Inner Council" \
  --body "## Summary
- Integrated KnowledgeBeast for RAG
- Added Inner Council advisory endpoints
- Created persona store

## Test Plan
- [ ] Backend starts without errors
- [ ] Health endpoint returns OK
- [ ] Personas load correctly"

# Frontend PR
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-worktrees/wt-frontend
gh pr create --base main --head feature/frontend-integration \
  --title "Frontend: Notebook Mode + Council UI" \
  --body "## Summary
- Connected frontend to backend API
- Implemented Notebook Mode UI
- Added Inner Council panel

## Test Plan
- [ ] npm run build succeeds
- [ ] Source upload works
- [ ] Council advisors respond"
```

## Keeping Worktrees Updated

### Pull Latest from Main

```bash
# In each worktree
git fetch origin
git rebase origin/main
```

### Sync Between Worktrees

If backend changes affect frontend (e.g., new API endpoints):

```bash
# In frontend worktree
git fetch origin feature/backend-setup
git merge origin/feature/backend-setup
```

## Managing Worktrees

### List Worktrees

```bash
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle
git worktree list
```

### Remove a Worktree

```bash
git worktree remove ../TeachAssist-worktrees/wt-backend
# Or force if there are changes
git worktree remove --force ../TeachAssist-worktrees/wt-backend
```

### Recreate a Worktree

```bash
# Remove old
git worktree remove ../TeachAssist-worktrees/wt-backend

# Create fresh from latest main
git worktree add ../TeachAssist-worktrees/wt-backend -b feature/backend-v2
```

## Troubleshooting

### "fatal: 'feature/backend-setup' is already checked out"

A branch can only be checked out in one worktree at a time.

```bash
# Check which worktree has it
git worktree list

# Either remove that worktree or use a different branch name
```

### Worktree is Locked

```bash
git worktree unlock ../TeachAssist-worktrees/wt-backend
```

### Changes in Wrong Worktree

If you accidentally made changes in main instead of a worktree:

```bash
# Stash changes
git stash

# Go to correct worktree
cd ../TeachAssist-worktrees/wt-backend

# Apply stash
git stash pop
```

## Best Practices

1. **One feature per worktree** - Don't mix unrelated changes
2. **Commit often** - Small, focused commits are easier to review
3. **Push daily** - Keep remote branches updated
4. **Rebase before PR** - Keep history clean
5. **Delete merged worktrees** - Clean up after features are merged
