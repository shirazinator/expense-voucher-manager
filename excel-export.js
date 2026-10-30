/**
 * Client-Side Excel Spreadsheet Exporter
 * Runs 100% in the browser using SheetJS (XLSX).
 * Generates matching .xlsx reports with 1-to-1 page matching directly on phone/laptop.
 * Includes Company Advance reconciliation.
 * Developed by Shiraz Khan
 */

function generateExcelReport(expenses, cycleLabel = 'Report', funds = []) {
  if (!window.XLSX) {
    throw new Error('SheetJS XLSX library not loaded');
  }

  const wb = XLSX.utils.book_new();

  // ================= SHEET 1: EXPENSE VOUCHERS =================
  const expRows = [
    ["S. No", "Date", "Description", "Category", "Amount(INR)", "Paid By", "Sheet Page number", "Remark"]
  ];

  let totalExpenses = 0;

  expenses.forEach((e, idx) => {
    const sNo = idx + 1;
    const pageNum = idx + 1; // 1-to-1 match with PDF voucher page
    const amtTotal = Number(e.amountTotal || 0);
    totalExpenses += amtTotal;

    expRows.push([
      sNo,
      String(e.date || ''),
      String(e.description || ''),
      String(e.category || ''),
      e.amountExpression || amtTotal,
      String(e.paidBy || 'Shiraz'),
      pageNum,
      String(e.remark || '')
    ]);
  });

  totalExpenses = Math.round(totalExpenses * 100) / 100;
  let totalAdvance = 0;
  (funds || []).forEach(f => {
    totalAdvance += Number(f.amountTotal || 0);
  });
  totalAdvance = Math.round(totalAdvance * 100) / 100;

  const netBalance = Math.round((totalExpenses - totalAdvance) * 100) / 100;

  // Spacer & Summary Rows
  expRows.push([]);
  expRows.push(["", "", "Total Expenses Spent:", "", totalExpenses, "", "", ""]);

  if (funds && funds.length > 0) {
    expRows.push(["", "", "Less: Company Advance Received:", "", totalAdvance, "", "", ""]);
    if (netBalance >= 0) {
      expRows.push(["", "", "NET REIMBURSEMENT PAYABLE TO EMPLOYEE:", "", netBalance, "", "", "Reimbursement claim above company advance"]);
    } else {
      expRows.push(["", "", "UNSPENT COMPANY ADVANCE BALANCE:", "", Math.abs(netBalance), "", "", "Advance balance remaining to return"]);
    }
  }

  const wsExpenses = XLSX.utils.aoa_to_sheet(expRows);

  wsExpenses['!cols'] = [
    { wch: 8 },  // S. No
    { wch: 14 }, // Date
    { wch: 34 }, // Description
    { wch: 18 }, // Category
    { wch: 16 }, // Amount
    { wch: 12 }, // Paid By
    { wch: 20 }, // Sheet Page number
    { wch: 45 }  // Remark
  ];

  XLSX.utils.book_append_sheet(wb, wsExpenses, "Expense Report");

  // ================= SHEET 2: COMPANY ADVANCES / FUNDS RECEIVED =================
  if (funds && funds.length > 0) {
    const fundRows = [
      ["S. No", "Date", "Source / Given By", "Amount(INR)", "Proof Attached", "Reference / Note"]
    ];

    funds.forEach((f, idx) => {
      fundRows.push([
        idx + 1,
        String(f.date || ''),
        String(f.source || 'Company Advance'),
        f.amountExpression || f.amountTotal,
        (f.payments && f.payments.length > 0) ? `Yes (${f.payments.length})` : 'No',
        String(f.remark || '')
      ]);
    });

    fundRows.push([]);
    fundRows.push(["", "", "Total Advance Received:", totalAdvance, "", ""]);

    const wsFunds = XLSX.utils.aoa_to_sheet(fundRows);
    wsFunds['!cols'] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 26 },
      { wch: 16 },
      { wch: 16 },
      { wch: 45 }
    ];
    XLSX.utils.book_append_sheet(wb, wsFunds, "Company Advances");
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

window.generateExcelReport = generateExcelReport;
