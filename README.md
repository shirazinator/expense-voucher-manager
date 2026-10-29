# 🧾 Expense Voucher & Bill Manager (Serverless PWA)

A 100% private, client-side expense voucher manager and audit PDF generator.
Runs entirely in your web browser (iPhone, Android, Mac, Windows). **No backend server required. Zero data leaves your device.**

Live Demo / Hosted on GitHub Pages:  
👉 **`https://shirazinator.github.io/expense-voucher-manager/`**

---

## 🔒 100% Device-Level Privacy (Zero Data Breach Risk)
- **Local Sandbox Storage (IndexedDB):** All expenses, PhonePe screenshots, and camera bill photos are stored strictly inside your phone’s browser sandbox.
- **Zero Server Hosting:** Nothing is transmitted to any cloud database or server.
- **Each User Gets Their Own Isolated App:** Anyone who opens the link gets their own private database on their device with zero overlap.

---

## ✨ Core Features
1. **Instant Screenshot Pasting (`Cmd+V` / `Ctrl+V`):**
   - Copy or take a screenshot on your device, press `Cmd+V`, and it attaches directly to your transaction voucher.
2. **In-App Camera Capture:**
   - Tap **"Take Photo"** to open your mobile camera directly and snap paper receipts on the fly.
3. **Split Payment Formulas:**
   - Supports expressions like `141+10` or `235+20` or `3600+4800+100`. Automatically calculates totals and stacks proofs neatly.
4. **Billing Cycle Exports (e.g., Nov 5 to Nov 30):**
   - **Download PDF Vouchers:** Exact 1-page-per-voucher audit PDF generated directly inside the browser using `pdf-lib`.
   - **Download Excel (.xlsx):** Matching spreadsheet generated directly in the browser using `SheetJS`.
   - **Download Full Bundle (ZIP):** Bundles PDF, Excel sheet, and all raw receipt photos into one archive using `JSZip`.
5. **Installable PWA:**
   - Can be added to your iPhone or Android Home Screen as a standalone full-screen app.
   - Works offline via Service Worker.

---

## 🌐 Enabling Free GitHub Pages (1-Minute Setup)
1. Go to your repository on GitHub:  
   **`https://github.com/shirazinator/expense-voucher-manager`**
2. Click **Settings** (tab at the top).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **`main`**
   - Folder: **`/ (root)`**
5. Click **Save**.
6. Wait 30 seconds — your live app will be published at:  
   `https://shirazinator.github.io/expense-voucher-manager/`
