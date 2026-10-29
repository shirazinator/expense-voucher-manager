#!/usr/bin/env bash

# Move to the script's directory
cd "$(dirname "$0")"

echo "============================================================"
echo "          Expense Voucher & Bill Manager Launcher          "
echo "============================================================"
echo ""

# Find Python
if command -v python3 &>/dev/null; then
    PY_CMD="python3"
elif command -v python &>/dev/null; then
    PY_CMD="python"
else
    echo "Error: Python 3 was not found on your system."
    echo "Please install Python from https://www.python.org/"
    exit 1
fi

echo "[1/3] Checking dependencies..."
$PY_CMD -m pip install -q -r requirements.txt --break-system-packages 2>/dev/null || $PY_CMD -m pip install -q -r requirements.txt 2>/dev/null

echo "[2/3] Checking database..."
$PY_CMD seed_data.py

# Find local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

echo "[3/3] Starting Local Server..."
echo ""
echo "📱 Open on your Mac:               http://localhost:5050"
echo "📲 Open on iPhone / Android:       http://${LOCAL_IP}:5050"
echo "   (Ensure your phone and Mac are connected to the same Wi-Fi)"
echo ""
echo "To stop the server:                Press Ctrl + C"
echo "============================================================"
echo ""

# Automatically open browser on Mac
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 1 && open "http://localhost:5050") &
fi

$PY_CMD app.py
