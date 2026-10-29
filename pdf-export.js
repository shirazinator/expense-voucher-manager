/**
 * Client-Side PDF Voucher Generator
 * Runs 100% in the browser using PDF-Lib.
 * Generates identical audit-grade 1-page-per-voucher PDFs directly on the user's phone/laptop.
 */

async function blobToArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

// Convert any image (PNG, WebP, HEIC, JPEG) to JPEG ArrayBuffer for safe PDF embedding
async function ensureJpegBuffer(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const maxDim = 1500;
      let w = img.width;
      let h = img.height;
      if (Math.max(w, h) > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob((jpegBlob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(jpegBlob);
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image blob'));
    };
    img.src = url;
  });
}

async function generatePDFVouchers(expenses, cycleLabel = 'Report') {
  if (!window.PDFLib) {
    throw new Error('PDF-Lib library not loaded');
  }

  const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
  const pdfDoc = await PDFDocument.create();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const totalPages = expenses.length;
  const totalClaim = expenses.reduce((sum, e) => sum + (e.amountTotal || 0), 0);

  // Helper colors
  const navy = rgb(0.118, 0.227, 0.541);      // #1E3A8A
  const slateDark = rgb(0.059, 0.09, 0.165);  // #0F172A
  const slateMed = rgb(0.278, 0.333, 0.412);  // #475569
  const slateLight = rgb(0.392, 0.455, 0.545);// #64748B
  const emerald = rgb(0.016, 0.471, 0.341);   // #047857
  const borderGrey = rgb(0.796, 0.835, 0.882);// #CBD5E1
  const bgCard = rgb(0.973, 0.98, 0.988);     // #F8FAFC
  const white = rgb(1, 1, 1);
  const amberBg = rgb(1, 0.984, 0.922);       // #FFFBEB
  const amberBorder = rgb(0.992, 0.827, 0.302);// #FCD34D
  const amberText = rgb(0.573, 0.251, 0.055); // #92400E

  for (let idx = 0; idx < expenses.length; idx++) {
    const row = expenses[idx];
    const itemNum = idx + 1;
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

    // Draw Top Header Card
    const cardX = 24;
    const cardH = 92;
    const cardY = PAGE_H - 20 - cardH;
    const cardW = PAGE_W - 48;

    // Card Background
    page.drawRectangle({
      x: cardX,
      y: cardY,
      width: cardW,
      height: cardH,
      color: bgCard,
      borderColor: borderGrey,
      borderWidth: 0.75
    });

    // Top Title & Badge
    page.drawText('EXPENSE VOUCHER & PAYMENT CONFIRMATION', {
      x: cardX + 12,
      y: cardY + cardH - 18,
      size: 10.5,
      font: fontBold,
      color: navy
    });

    const badgeText = `ITEM ${itemNum} OF ${totalPages}`;
    const badgeW = fontBold.widthOfTextAtSize(badgeText, 8) + 14;
    const badgeX = cardX + cardW - 12 - badgeW;
    const badgeY = cardY + cardH - 22;

    page.drawRectangle({
      x: badgeX,
      y: badgeY,
      width: badgeW,
      height: 15,
      color: navy
    });

    page.drawText(badgeText, {
      x: badgeX + 7,
      y: badgeY + 4,
      size: 8,
      font: fontBold,
      color: white
    });

    // Divider Line
    page.drawLine({
      start: { x: cardX + 12, y: cardY + cardH - 26 },
      end: { x: cardX + cardW - 12, y: cardY + cardH - 26 },
      thickness: 0.5,
      color: rgb(0.886, 0.91, 0.941)
    });

    // Row 1 Metadata
    const yRow1 = cardY + cardH - 40;
    page.drawText('DATE:', { x: cardX + 12, y: yRow1, size: 7.5, font: fontRegular, color: slateLight });
    page.drawText(String(row.date || ''), { x: cardX + 42, y: yRow1, size: 8.5, font: fontBold, color: slateDark });

    page.drawText('CATEGORY:', { x: cardX + 115, y: yRow1, size: 7.5, font: fontRegular, color: slateLight });
    page.drawText(String(row.category || ''), { x: cardX + 172, y: yRow1, size: 8.5, font: fontBold, color: slateDark });

    page.drawText('PAID BY:', { x: cardX + 280, y: yRow1, size: 7.5, font: fontRegular, color: slateLight });
    page.drawText(String(row.paidBy || 'Shiraz'), { x: cardX + 325, y: yRow1, size: 8.5, font: fontBold, color: slateDark });

    const amtStr = `Rs. ${row.amountExpression || row.amountTotal}`;
    const amtW = fontBold.widthOfTextAtSize(amtStr, 11);
    page.drawText('AMOUNT:', { x: cardX + cardW - 12 - amtW - 48, y: yRow1, size: 7.5, font: fontRegular, color: slateLight });
    page.drawText(amtStr, { x: cardX + cardW - 12 - amtW, y: yRow1 - 1, size: 11, font: fontBold, color: emerald });

    // Row 2 Description
    const yRow2 = cardY + cardH - 57;
    page.drawText('DESCRIPTION:', { x: cardX + 12, y: yRow2, size: 7.5, font: fontRegular, color: slateLight });
    let descTxt = String(row.description || '');
    if (descTxt.length > 85) descTxt = descTxt.substring(0, 82) + '...';
    page.drawText(descTxt, { x: cardX + 85, y: yRow2, size: 9, font: fontBold, color: slateDark });

    // Row 3 Remark
    const yRow3 = cardY + cardH - 73;
    const remark = String(row.remark || '');
    if (remark) {
      page.drawText('AUDIT NOTE:', { x: cardX + 12, y: yRow3, size: 7, font: fontRegular, color: slateMed });
      let rTxt = remark;
      if (rTxt.length > 105) rTxt = rTxt.substring(0, 102) + '...';
      page.drawText(rTxt, { x: cardX + 72, y: yRow3, size: 7.5, font: fontOblique, color: slateMed });
    } else {
      page.drawText('No additional remarks.', { x: cardX + 12, y: yRow3, size: 7.5, font: fontOblique, color: slateLight });
    }

    // Draw Footer
    const footY = 16;
    page.drawLine({
      start: { x: 24, y: 28 },
      end: { x: PAGE_W - 24, y: 28 },
      thickness: 0.5,
      color: rgb(0.886, 0.91, 0.941)
    });

    page.drawText('Expense Claim • Shiraz Khan (Tour / Work Expenses)', {
      x: 24,
      y: footY,
      size: 7.5,
      font: fontRegular,
      color: slateLight
    });

    const totalTxt = `Total Claim: Rs. ${totalClaim.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    page.drawText(totalTxt, {
      x: PAGE_W / 2 - 40,
      y: footY,
      size: 7.5,
      font: fontBold,
      color: slateMed
    });

    const pageTxt = `Page ${itemNum} of ${totalPages}`;
    const pageW = fontBold.widthOfTextAtSize(pageTxt, 8);
    page.drawText(pageTxt, {
      x: PAGE_W - 24 - pageW,
      y: footY,
      size: 8,
      font: fontBold,
      color: navy
    });

    // Content Dimensions for Images
    const contentY = 34;
    const contentH = cardY - 10 - contentY; // ~685 pt
    const contentW = PAGE_W - 48; // ~547 pt

    const payments = row.payments || [];
    const bills = row.bills || [];
    const amtParts = String(row.amountExpression || '').split('+');

    const colW = (contentW - 12) / 2;
    const col1X = 24;
    const col2X = col1X + colW + 12;

    // Helper to draw image box with title
    async function drawImgBox(blob, title, x, y, w, h) {
      // Draw background box
      page.drawRectangle({
        x, y, width: w, height: h,
        color: white, borderColor: borderGrey, borderWidth: 0.75
      });

      // Title bar
      const barH = 18;
      page.drawRectangle({
        x, y: y + h - barH, width: w, height: barH,
        color: rgb(0.945, 0.961, 0.976), borderColor: borderGrey, borderWidth: 0.5
      });

      page.drawText(title, {
        x: x + 8,
        y: y + h - barH + 5,
        size: 7.5,
        font: fontBold,
        color: slateDark
      });

      if (blob) {
        try {
          const imgBuffer = await ensureJpegBuffer(blob);
          const embedded = await pdfDoc.embedJpg(imgBuffer);
          const pad = 4;
          const maxImgW = w - 2 * pad;
          const maxImgH = h - barH - 2 * pad;

          const imgAspect = embedded.width / embedded.height;
          const boxAspect = maxImgW / maxImgH;

          let drawW = maxImgW;
          let drawH = maxImgH;

          if (imgAspect > boxAspect) {
            drawH = maxImgW / imgAspect;
          } else {
            drawW = maxImgH * imgAspect;
          }

          const drawX = x + pad + (maxImgW - drawW) / 2;
          const drawY = y + pad + (maxImgH - drawH) / 2;

          page.drawImage(embedded, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH
          });
        } catch (err) {
          console.error('Error drawing image:', err);
        }
      }
    }

    function drawNoBillNotice(x, y, w, h, note) {
      page.drawRectangle({
        x, y, width: w, height: h,
        color: amberBg, borderColor: amberBorder, borderWidth: 0.75
      });

      const title = 'OFFICIAL BILL / INVOICE NOT ISSUED';
      const tW = fontBold.widthOfTextAtSize(title, 11);
      page.drawText(title, {
        x: x + (w - tW) / 2,
        y: y + h / 2 + 25,
        size: 11,
        font: fontBold,
        color: amberText
      });

      const sub1 = 'Vendor does not provide printed GST bill / bill machine unavailable.';
      const s1W = fontRegular.widthOfTextAtSize(sub1, 8.5);
      page.drawText(sub1, {
        x: x + (w - s1W) / 2,
        y: y + h / 2 + 8,
        size: 8.5,
        font: fontRegular,
        color: amberText
      });

      const sub2 = 'Verified via Attached PhonePe Digital Payment Record';
      const s2W = fontBold.widthOfTextAtSize(sub2, 8);
      page.drawText(sub2, {
        x: x + (w - s2W) / 2,
        y: y + h / 2 - 10,
        size: 8,
        font: fontBold,
        color: navy
      });

      if (note) {
        let nTxt = `Note: ${note}`;
        if (nTxt.length > 60) nTxt = nTxt.substring(0, 57) + '...';
        const nW = fontOblique.widthOfTextAtSize(nTxt, 7.5);
        page.drawText(nTxt, {
          x: x + (w - nW) / 2,
          y: y + h / 2 - 28,
          size: 7.5,
          font: fontOblique,
          color: amberText
        });
      }
    }

    // Layout Logic
    if (payments.length === 3 && bills.length >= 1) {
      // 3 Payments + 1 Bill
      const c1W = 240;
      const c2W = contentW - c1W - 12;
      const slotH = (contentH - 16) / 3;

      for (let k = 0; k < 3; k++) {
        const sy = contentY + (2 - k) * (slotH + 8);
        const pLabel = `Payment Part ${k + 1}${k < amtParts.length ? ' (Rs. ' + amtParts[k].trim() + ')' : ''}`;
        await drawImgBox(payments[k]?.blob, pLabel, col1X, sy, c1W, slotH);
      }
      await drawImgBox(bills[0]?.blob, 'Official Invoice / Bill Copy', col1X + c1W + 12, contentY, c2W, contentH);

    } else if (payments.length === 1 && bills.length === 1) {
      // Standard: 1 PP + 1 Bill
      await drawImgBox(payments[0]?.blob, `Payment Proof (Rs. ${row.amountExpression || row.amountTotal})`, col1X, contentY, colW, contentH);
      await drawImgBox(bills[0]?.blob, 'Softcopy Bill / Tax Invoice', col2X, contentY, colW, contentH);

    } else if (payments.length >= 2 && bills.length === 1) {
      // 2 Stacked PP + 1 Bill
      const slotH = (contentH - 8) / 2;
      const p1Amt = amtParts[0] ? ` (Rs. ${amtParts[0].trim()})` : '';
      const p2Amt = amtParts[1] ? ` (Rs. ${amtParts[1].trim()})` : '';

      await drawImgBox(payments[0]?.blob, `Payment Part 1${p1Amt}`, col1X, contentY + slotH + 8, colW, slotH);
      await drawImgBox(payments[1]?.blob, `Payment Part 2${p2Amt}`, col1X, contentY, colW, slotH);
      await drawImgBox(bills[0]?.blob, 'Softcopy Bill / Tax Invoice', col2X, contentY, colW, contentH);

    } else if (payments.length === 1 && bills.length === 0) {
      // 1 PP + NO Bill
      await drawImgBox(payments[0]?.blob, `Payment Proof (Rs. ${row.amountExpression || row.amountTotal})`, col1X, contentY, colW, contentH);
      drawNoBillNotice(col2X, contentY + contentH / 3, colW, contentH / 3, row.remark);

    } else if (payments.length >= 2 && bills.length === 0) {
      // 2 PP + NO Bill
      const p1Amt = amtParts[0] ? ` (Rs. ${amtParts[0].trim()})` : '';
      const p2Amt = amtParts[1] ? ` (Rs. ${amtParts[1].trim()})` : '';

      await drawImgBox(payments[0]?.blob, `Payment Part 1${p1Amt}`, col1X, contentY, colW, contentH);
      await drawImgBox(payments[1]?.blob, `Payment Part 2${p2Amt}`, col2X, contentY, colW, contentH);

    } else if (payments.length === 0 && bills.length >= 1) {
      // Only Bill
      await drawImgBox(bills[0]?.blob, 'Softcopy Bill / Tax Invoice', col1X, contentY, contentW, contentH);

    } else {
      drawNoBillNotice(col1X, contentY + contentH / 3, contentW, contentH / 3, row.remark);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

window.generatePDFVouchers = generatePDFVouchers;
