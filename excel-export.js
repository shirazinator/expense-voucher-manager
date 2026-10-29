/**
 * Client-Side Excel Spreadsheet Exporter
 * Runs 100% in the browser using SheetJS (XLSX).
 * Generates matching .xlsx reports with 1-to-1 page matching directly on phone/laptop.
 */

function generateExcelReport(expenses, cycleLabel = 'Report') {
  if (!window.XLSX) {
    throw new Error('SheetJS XLSX library not loaded');
  }

  const rows = [
    ["S. No", "Date", "Description", "Category", "Amount(INR)", "Paid By", "Sheet Page number", "Remark"]
  ];

  let totalClaim = 0;

  expenses.forEach((e, idx) => {
    const sNo = idx + 1;
    const pageNum = idx + 1; // 1-to-1 match with PDF voucher page
    const amtTotal = Number(e.amountTotal || 0);
    totalClaim += amtTotal;

    rows.push([
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

  // Total summary row
  rows.push([]);
  rows.push([
    "", "", "Total Paid:", "", Math.round(totalClaim * 100) / 100, "", "", ""
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column width estimates
  ws['!cols'] = [
    { wch: 8 },  // S. No
    { wch: 14 }, // Date
    { wch: 32 }, // Description
    { wch: 18 }, // Category
    { wch: 16 }, // Amount
    { wch: 12 }, // Paid By
    { wch: 20 }, // Sheet Page number
    { wch: 45 }  // Remark
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Expense Report");

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

window.generateExcelReport = generateExcelReport;
