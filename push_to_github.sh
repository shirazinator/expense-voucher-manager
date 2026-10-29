#!/usr/bin/env bash
cd "/Users/code_red/.gemini/antigravity/scratch/expense_voucher_app"

echo "============================================================"
echo "      Pushing Expense Voucher Manager to GitHub             "
echo "      Repo: https://github.com/shirazinator/expense-voucher-manager"
echo "============================================================"
echo ""
echo "When prompted by GitHub:"
echo "  1. Username: shirazinator"
echo "  2. Password: Your GitHub Personal Access Token (classic)"
echo ""
echo "Need a token? Create one in 30 seconds at:"
echo "https://github.com/settings/tokens (select 'repo' scope)"
echo "============================================================"
echo ""

git push -u origin main

echo ""
read -p "Press [Enter] to close this window..."
