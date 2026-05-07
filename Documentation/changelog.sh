#!/bin/bash
# changelog.sh — Log code changes with date/time to CHANGELOG.md
# Usage:
#   ./changelog.sh "Brief description of the change"
#   ./changelog.sh                        # Interactive mode (prompts)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHANGELOG="$SCRIPT_DIR/CHANGELOG.md"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ ! -f "$CHANGELOG" ]; then
    echo "# Change Log" > "$CHANGELOG"
    echo "" >> "$CHANGELOG"
    echo "All notable changes to this project after V1.0 are documented here." >> "$CHANGELOG"
    echo "" >> "$CHANGELOG"
    echo "---" >> "$CHANGELOG"
    echo "" >> "$CHANGELOG"
fi

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Capture git diff summary (staged + unstaged) if in a git repo
GIT_SUMMARY=""
if git -C "$PROJECT_DIR" rev-parse --git-dir > /dev/null 2>&1; then
    DIFF_OUTPUT=$(git -C "$PROJECT_DIR" diff --stat 2>/dev/null)
    STAGED_OUTPUT=$(git -C "$PROJECT_DIR" diff --cached --stat 2>/dev/null)
    if [ -n "$DIFF_OUTPUT" ] || [ -n "$STAGED_OUTPUT" ]; then
        GIT_SUMMARY="### Files Changed\n"
        if [ -n "$STAGED_OUTPUT" ]; then
            GIT_SUMMARY+="Staged:\n\`\`\`\n$STAGED_OUTPUT\n\`\`\`\n"
        fi
        if [ -n "$DIFF_OUTPUT" ]; then
            GIT_SUMMARY+="Unstaged:\n\`\`\`\n$DIFF_OUTPUT\n\`\`\`\n"
        fi
    fi

    # Also check for untracked files
    UNTRACKED=$(git -C "$PROJECT_DIR" ls-files --others --exclude-standard 2>/dev/null | grep -v 'Documentation/' | head -20)
    if [ -n "$UNTRACKED" ]; then
        GIT_SUMMARY+="\n### Untracked Files\n\`\`\`\n$UNTRACKED\n\`\`\`\n"
    fi
fi

DESCRIPTION="$*"

if [ -z "$DESCRIPTION" ]; then
    echo "=== Change Log Logger ==="
    echo "Enter a description of the changes (Ctrl+D to finish):"
    DESCRIPTION=$(cat)
fi

if [ -z "$DESCRIPTION" ]; then
    echo "No description provided. Aborting."
    exit 1
fi

{
    echo "## [$TIMESTAMP]"
    echo ""
    echo "$DESCRIPTION"
    echo ""
    if [ -n "$GIT_SUMMARY" ]; then
        echo -e "$GIT_SUMMARY"
    fi
    echo "---"
    echo ""
} >> "$CHANGELOG"

echo "Change logged to $CHANGELOG at $TIMESTAMP"
