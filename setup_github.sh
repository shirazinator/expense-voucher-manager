#!/usr/bin/env bash

# Move to app directory
cd "$(dirname "$0")"

echo "============================================================"
echo "          Link Expense Voucher App to Your GitHub          "
echo "============================================================"
echo ""

REPO_URL="$1"

if [ -z "$REPO_URL" ]; then
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: expense-voucher-manager (or any name you prefer)"
    echo "3. Choose 'Private' (recommended) or 'Public'"
    echo "4. Click 'Create repository' (leave README, .gitignore unselected)"
    echo ""
    read -p "Paste your GitHub repository URL here: " REPO_URL
fi

if [ -z "$REPO_URL" ]; then
    echo "No URL provided. Exiting."
    exit 1
fi

# Remove existing origin if any
git remote remove origin 2>/dev/null

# Add new origin
git remote add origin "$REPO_URL"
git branch -M main

echo ""
echo "Pushing code to $REPO_URL on branch 'main'..."
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================================"
    echo " SUCCESS! Your project is now safely backed up on GitHub!   "
    echo "============================================================"
else
    echo ""
    echo "Note: If asked for credentials, use your GitHub Username and a"
    echo "Personal Access Token (classic) with 'repo' scope from:"
    echo "https://github.com/settings/tokens"
fi
