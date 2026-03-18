#!/usr/bin/env bash
# deploy.sh — runs on the self-hosted runner when main is pushed.
# Called from the project root by cd.yml.
#
# Requires:
#   - pnpm installed globally
#   - pm2 installed globally (npm install -g pm2)
#   - .env.local written by cd.yml before this script runs

set -euo pipefail

# Resolve project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=== Frontend deploy started at $(date) ==="
echo "Working directory: $PROJECT_ROOT"

# ── Step 1: Install dependencies ─────────────────────────────────────────────
echo "--- Installing dependencies ---"
pnpm install --frozen-lockfile

# ── Step 2: Build Next.js production bundle ───────────────────────────────────
echo "--- Building Next.js production bundle ---"
pnpm build

# ── Step 3: Restart or start Next.js with pm2 ────────────────────────────────
echo "--- Deploying with pm2 ---"
if pm2 describe jira-frontend > /dev/null 2>&1; then
    echo "Process 'jira-frontend' exists — restarting..."
    pm2 restart jira-frontend
else
    echo "Process 'jira-frontend' not found — starting fresh..."
    pm2 start pnpm --name jira-frontend -- start
fi

# Save the pm2 process list so it survives reboots
pm2 save

echo "=== Frontend deploy complete at $(date) ==="
echo ""
echo "pm2 status:"
pm2 list
