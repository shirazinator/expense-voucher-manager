# 🧾 Expense Voucher & Company Advance Manager (Serverless PWA)

A 100% private, client-side expense voucher manager, company advance tracker, and audit PDF generator.
Designed & Developed by **Shiraz Khan**.
Runs entirely in your web browser (iPhone, Android, Mac, Windows). **No backend server required. Zero data leaves your device.**

Live Web App / Hosted on GitHub Pages:  
👉 **`https://shirazinator.github.io/expense-voucher-manager/`**

---

## 🔒 100% Device-Level Privacy (Zero Data Breach Risk)
- **Local Sandbox Storage (IndexedDB):** All expenses, company advances, PhonePe screenshots, and camera bill photos are stored strictly inside your phone’s browser sandbox.
- **Zero Server Hosting:** Nothing is transmitted to any cloud database or server.
- **Each User Gets Their Own Isolated App:** Anyone who opens the link gets their own private database on their device with zero overlap.

---

## ✨ Core Features

1. **Company Advance & Project Fund Tracker (New):**
   - Record company advances received before or during a project/tour (e.g., initial ₹20,000 + extra ₹5,000).
   - Attach bank transfer screenshots / SMS slips.
   - Dynamic Financial Settlement Calculation:
     - **Reimbursement Due to You:** If expenses exceed the advance, calculates the exact out-of-pocket balance the company needs to pay you back.
     - **Unspent Advance Remaining:** If the advance exceeds expenses, calculates the balance to return to the company.

2. **Instant Screenshot Pasting (`Cmd+V` / `Ctrl+V`):**
   - Copy or take a screenshot on your device, press `Cmd+V`, and it attaches directly to your transaction voucher or advance proof.

3. **In-App Camera Capture:**
   - Tap **"Take Photo"** to open your mobile camera directly and snap paper receipts on the fly.

4. **Split Payment Formulas:**
   - Supports expressions like `141+10` or `235+20` or `3600+4800+100`. Automatically calculates totals and stacks proofs neatly.

5. **Trip & Date Range Filter:**
   - Filter expenses for a specific project tour or monthly billing cycle without mixing with other records.
   - Quick presets: All Records, Oct Tour (6-18), This Month, Last 30 Days.

6. **Official Audit Exports (100% In-Browser):**
   - **Download PDF Vouchers:** Exact 1-page-per-voucher audit PDF generated directly inside the browser using `pdf-lib` with financial advance summary in the footer.
   - **Download Excel (.xlsx):** Multi-sheet workbook (`SheetJS`) containing Sheet 1 (Expenses with Advance Less & Net Reimbursement calculation) and Sheet 2 (Company Advances itemized).
   - **Download Full Bundle (ZIP):** Bundles PDF, Excel sheet, raw receipt photos, and advance transfer slips into one archive using `JSZip`.

7. **Installable PWA:**
   - Can be added to your iPhone or Android Home Screen as a standalone full-screen app.
   - Works offline via Service Worker.

---

## 🌐 Enabling Free GitHub Pages
1. Go to your repository on GitHub:  
   **`https://github.com/shirazinator/expense-voucher-manager`**
2. Click **Settings** ➔ **Pages**.
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **`main`**
   - Folder: **`/ (root)`**
4. Click **Save**.
5. Your live app is available at:  
   `https://shirazinator.github.io/expense-voucher-manager/`
