# 🧾 Expense Voucher & Bill Manager (Local Web App)

A specialized daily expense tracking application designed for business travel and reimbursement claims. It pairs digital payment screenshots (PhonePe, GPay, Paytm) with softcopy bills/receipts, and generates audit-ready, 1-page-per-voucher PDFs and matching Excel spreadsheets for any billing cycle (e.g., Nov 5 to Nov 30).

---

## 🚀 Quick Start (Local Setup)

### Option 1: Double-Click (macOS Finder)
Simply double-click **`start.command`** in the application folder. It will automatically check dependencies, initialize the database, start the server, and open `http://localhost:5050` in your web browser.

### Option 2: Terminal
```bash
cd /Users/code_red/.gemini/antigravity/scratch/expense_voucher_app
bash run.sh
```

---

## ✨ Features

1. **Daily Expense Recording:**
   - **Smart Split Formula Support:** Type `141+10` or `235+20` or `3600+4800+100` and the app calculates the true total automatically.
   - **Quick Category Pills:** 1-tap select for `Food`, `Travel`, `Fuel`, `Hotel`, `Medical`, `Supplies`, `Other`.
   - **Audit Notes & Chips:** 1-tap presets for common notes (*"Bill not available"*, *"Machine out of order"*, *"Extra water bottle charge"*).

2. **Frictionless Screenshot & Bill Attachments:**
   - **Clipboard Paste (`Cmd+V` / `Ctrl+V`):** Take a screenshot on your computer or phone, press `Cmd+V`, and the screenshot attaches directly to the transaction!
   - **In-App Camera Capture:** On mobile phones, tapping **"Take Photo"** launches your device camera directly to photograph paper bills on the spot.
   - **Multi-Attachment Support:** Attach 1, 2, or 3 payment screenshots and multiple bill pages for a single transaction.

3. **Custom Billing Cycle Exports (e.g., Nov 5 to Nov 30):**
   - Filter by date range or preset cycles.
   - **Download PDF Vouchers:** Generates the exact 1-page-per-voucher audit report with side-by-side or stacked payment screenshots and bills, sequential voucher numbering, and official "No Bill Issued" audit notices.
   - **Download Excel (.xlsx):** Generates the matching spreadsheet with `S. No`, `Date`, `Description`, `Category`, `Amount(INR)`, `Paid By`, `Sheet Page number` (matching the PDF page!), and `Remark`.
   - **Download Full Bundle (ZIP):** Bundles the PDF, Excel sheet, and all raw receipt images into one organized archive.

4. **Pre-Seeded Historical Data:**
   - Pre-loaded with all 56 records, 65 payment screenshots, and 42 softcopy bills from the October tour, so you can test exports immediately or review past claims.
