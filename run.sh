#!/usr/bin/env bash

# Move to the script's directory
cd "$(dirname "$0")"

echo "============================================================"
echo "   Expense Voucher & Bill Manager (Serverless PWA)          "
echo "============================================================"
echo ""
echo "🔒 100% Device Sandbox: Zero data stored on your Mac."
echo "📱 Local Testing Server (Runs completely in your browser)"
echo ""

# Find local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
PORT=5050

echo "📱 Open on your Mac:               http://localhost:${PORT}"
echo "📲 Open on iPhone / Android:       http://${LOCAL_IP}:${PORT}"
echo "   (Ensure your phone and Mac are connected to the same Wi-Fi)"
echo ""
echo "To stop the server:                Press Ctrl + C"
echo "============================================================"
echo ""

# Automatically open browser on Mac
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 1 && open "http://localhost:${PORT}") &
fi

python3 -m http.server ${PORT}
