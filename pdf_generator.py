import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from PIL import Image

PAGE_W, PAGE_H = A4

def get_optimized_image(src_path, cache_dir, max_dim=1500, quality=85):
    """Caches resized and JPEG-optimized images to keep PDF size light and crisp."""
    if not src_path or not os.path.exists(src_path):
        return None
    os.makedirs(cache_dir, exist_ok=True)
    base_name = os.path.basename(src_path)
    opt_path = os.path.join(cache_dir, f"opt_{max_dim}_{base_name}")
    if os.path.exists(opt_path):
        return opt_path
    try:
        im = Image.open(src_path)
        if max(im.size) > max_dim:
            scale = max_dim / max(im.size)
            new_size = (int(im.size[0] * scale), int(im.size[1] * scale))
            im_resized = im.resize(new_size, Image.Resampling.LANCZOS)
        else:
            im_resized = im
        if im_resized.mode in ('RGBA', 'P'):
            im_resized = im_resized.convert('RGB')
        im_resized.save(opt_path, 'JPEG', quality=quality, optimize=True)
        return opt_path
    except Exception as e:
        print(f"Failed to optimize {src_path}: {e}")
        return src_path

def draw_header_card(c, row, item_num, total_items):
    card_x = 24
    card_y = PAGE_H - 20 - 92
    card_w = PAGE_W - 48
    card_h = 92

    # Background card
    c.setFillColor(colors.HexColor('#F8FAFC'))
    c.setStrokeColor(colors.HexColor('#CBD5E1'))
    c.setLineWidth(0.75)
    c.roundRect(card_x, card_y, card_w, card_h, 6, fill=1, stroke=1)

    # Top Title & Badge
    c.setFillColor(colors.HexColor('#1E3A8A'))
    c.setFont('Helvetica-Bold', 10.5)
    c.drawString(card_x + 12, card_y + card_h - 18, 'EXPENSE VOUCHER & PAYMENT CONFIRMATION')

    # Badge on right
    badge_text = f"ITEM {item_num} OF {total_items}"
    c.setFont('Helvetica-Bold', 8)
    badge_w = c.stringWidth(badge_text, 'Helvetica-Bold', 8) + 14
    badge_x = card_x + card_w - 12 - badge_w
    badge_y = card_y + card_h - 22
    c.setFillColor(colors.HexColor('#1E3A8A'))
    c.roundRect(badge_x, badge_y, badge_w, 15, 3, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.drawCentredString(badge_x + badge_w/2, badge_y + 4, badge_text)

    # Divider
    c.setStrokeColor(colors.HexColor('#E2E8F0'))
    c.setLineWidth(0.5)
    c.line(card_x + 12, card_y + card_h - 26, card_x + card_w - 12, card_y + card_h - 26)

    # Row 1 Metadata
    y_row1 = card_y + card_h - 40
    c.setFont('Helvetica', 7.5)
    c.setFillColor(colors.HexColor('#64748B'))
    c.drawString(card_x + 12, y_row1, 'DATE:')
    c.setFont('Helvetica-Bold', 8.5)
    c.setFillColor(colors.HexColor('#0F172A'))
    c.drawString(card_x + 42, y_row1, str(row.get('date', '')))

    c.setFont('Helvetica', 7.5)
    c.setFillColor(colors.HexColor('#64748B'))
    c.drawString(card_x + 115, y_row1, 'CATEGORY:')
    c.setFont('Helvetica-Bold', 8.5)
    c.setFillColor(colors.HexColor('#0F172A'))
    c.drawString(card_x + 172, y_row1, str(row.get('category', '')))

    c.setFont('Helvetica', 7.5)
    c.setFillColor(colors.HexColor('#64748B'))
    c.drawString(card_x + 280, y_row1, 'PAID BY:')
    c.setFont('Helvetica-Bold', 8.5)
    c.setFillColor(colors.HexColor('#0F172A'))
    c.drawString(card_x + 325, y_row1, str(row.get('paid_by', 'Shiraz') or 'Shiraz'))

    # Amount on right
    amt_str = f"Rs. {row.get('amount_expression', row.get('amount_total', ''))}"
    amt_w = c.stringWidth(amt_str, 'Helvetica-Bold', 11)
    c.setFont('Helvetica', 7.5)
    c.setFillColor(colors.HexColor('#64748B'))
    c.drawRightString(card_x + card_w - 12 - amt_w - 6, y_row1, 'AMOUNT:')
    c.setFont('Helvetica-Bold', 11)
    c.setFillColor(colors.HexColor('#047857'))
    c.drawRightString(card_x + card_w - 12, y_row1 - 1, amt_str)

    # Row 2: Description
    y_row2 = card_y + card_h - 57
    c.setFont('Helvetica', 7.5)
    c.setFillColor(colors.HexColor('#64748B'))
    c.drawString(card_x + 12, y_row2, 'DESCRIPTION:')
    c.setFont('Helvetica-Bold', 9)
    c.setFillColor(colors.HexColor('#0F172A'))
    desc_txt = str(row.get('description', ''))
    if len(desc_txt) > 85:
        desc_txt = desc_txt[:82] + '...'
    c.drawString(card_x + 85, y_row2, desc_txt)

    # Row 3: Remark (if any)
    y_row3 = card_y + card_h - 73
    remark = str(row.get('remark', '') or '')
    if remark:
        c.setFont('Helvetica', 7)
        c.setFillColor(colors.HexColor('#475569'))
        c.drawString(card_x + 12, y_row3, 'AUDIT NOTE:')
        c.setFont('Helvetica-Oblique', 7.5)
        c.setFillColor(colors.HexColor('#334155'))
        if len(remark) > 105:
            remark = remark[:102] + '...'
        c.drawString(card_x + 72, y_row3, remark)
    else:
        c.setFont('Helvetica-Oblique', 7.5)
        c.setFillColor(colors.HexColor('#94A3B8'))
        c.drawString(card_x + 12, y_row3, 'No additional remarks.')

def draw_footer(c, current_page, total_pages, total_amount):
    foot_y = 16
    c.setStrokeColor(colors.HexColor('#E2E8F0'))
    c.setLineWidth(0.5)
    c.line(24, 28, PAGE_W - 24, 28)

    c.setFont('Helvetica', 7.5)
    c.setFillColor(colors.HexColor('#64748B'))
    c.drawString(24, foot_y, 'Expense Claim • Shiraz Khan (Tour / Work Expenses)')

    c.setFont('Helvetica-Bold', 7.5)
    c.setFillColor(colors.HexColor('#334155'))
    c.drawCentredString(PAGE_W / 2 + 10, foot_y, f'Total Claim: Rs. {total_amount:,.2f}')

    c.setFont('Helvetica-Bold', 8)
    c.setFillColor(colors.HexColor('#1E3A8A'))
    c.drawRightString(PAGE_W - 24, foot_y, f'Page {current_page} of {total_pages}')

def draw_image_box(c, img_path, title, x, y, w, h, cache_dir, is_warning=False):
    # Container box
    c.setFillColor(colors.HexColor('#FFFFFF'))
    c.setStrokeColor(colors.HexColor('#CBD5E1'))
    c.setLineWidth(0.75)
    c.roundRect(x, y, w, h, 4, fill=1, stroke=1)

    # Title Banner at top of box
    banner_h = 18
    if is_warning:
        c.setFillColor(colors.HexColor('#FEF3C7'))
        c.setStrokeColor(colors.HexColor('#FDE68A'))
        title_color = colors.HexColor('#92400E')
    else:
        c.setFillColor(colors.HexColor('#F1F5F9'))
        c.setStrokeColor(colors.HexColor('#CBD5E1'))
        title_color = colors.HexColor('#1E293B')

    c.roundRect(x, y + h - banner_h, w, banner_h, 3, fill=1, stroke=1)
    c.setFont('Helvetica-Bold', 7.5)
    c.setFillColor(title_color)
    c.drawString(x + 8, y + h - banner_h + 5, title)

    # Inside image area
    pad = 4
    img_x = x + pad
    img_y = y + pad
    img_w = w - 2*pad
    img_h = h - banner_h - 2*pad

    if img_path and os.path.exists(img_path):
        opt_img = get_optimized_image(img_path, cache_dir)
        try:
            c.drawImage(opt_img, img_x, img_y, width=img_w, height=img_h, preserveAspectRatio=True, anchor='c')
        except Exception as e:
            print(f"Error drawing image {opt_img}: {e}")
            c.setFont('Helvetica', 8)
            c.setFillColor(colors.red)
            c.drawCentredString(x + w/2, y + h/2, f'Error loading image: {e}')

def draw_no_bill_notice(c, x, y, w, h, note=""):
    c.setFillColor(colors.HexColor('#FFFBEB'))
    c.setStrokeColor(colors.HexColor('#FCD34D'))
    c.setLineWidth(0.75)
    c.roundRect(x, y, w, h, 4, fill=1, stroke=1)

    c.setFont('Helvetica-Bold', 11)
    c.setFillColor(colors.HexColor('#B45309'))
    c.drawCentredString(x + w/2, y + h/2 + 25, 'OFFICIAL BILL / INVOICE NOT ISSUED')

    c.setFont('Helvetica', 8.5)
    c.setFillColor(colors.HexColor('#92400E'))
    c.drawCentredString(x + w/2, y + h/2 + 8, 'Vendor does not provide printed GST bill / bill machine unavailable.')

    c.setFont('Helvetica-Bold', 8)
    c.setFillColor(colors.HexColor('#1E3A8A'))
    c.drawCentredString(x + w/2, y + h/2 - 10, 'Verified via Attached PhonePe Digital Payment Record')

    if note:
        c.setFont('Helvetica-Oblique', 7.5)
        c.setFillColor(colors.HexColor('#78350F'))
        c.drawCentredString(x + w/2, y + h/2 - 28, f'Note: {str(note)[:65]}')

def generate_pdf_report(expenses, output_path, cache_dir=None):
    if not cache_dir:
        cache_dir = os.path.join(os.path.dirname(output_path), 'cache')
    os.makedirs(cache_dir, exist_ok=True)

    c = canvas.Canvas(output_path, pagesize=A4)
    total_pages = len(expenses)
    total_claim = sum(float(e.get('amount_total', 0) or 0) for e in expenses)

    content_y = 34
    content_h = (PAGE_H - 20 - 92) - 10 - content_y # ~685 pt
    content_w = PAGE_W - 48 # ~547 pt

    for idx, row in enumerate(expenses):
        item_num = idx + 1
        draw_header_card(c, row, item_num, total_pages)
        draw_footer(c, item_num, total_pages, total_claim)

        # Get file paths
        pp_paths = [a['file_path'] for a in row.get('payments', []) if os.path.exists(a.get('file_path', ''))]
        bill_paths = [a['file_path'] for a in row.get('bills', []) if os.path.exists(a.get('file_path', ''))]

        col_w = (content_w - 12) / 2
        col1_x = 24
        col2_x = col1_x + col_w + 12

        amt_exp = str(row.get('amount_expression', row.get('amount_total', '')))
        amt_parts = amt_exp.split('+')

        # Layout Cases
        if len(pp_paths) == 3 and len(bill_paths) >= 1:
            # 3 PhonePe payments stacked + 1 main bill
            c1_w = 240
            c2_w = content_w - c1_w - 12
            c1_x = 24
            c2_x = c1_x + c1_w + 12

            slot_h = (content_h - 16) / 3
            for k in range(3):
                sy = content_y + (2 - k) * (slot_h + 8)
                p_label = f"PhonePe Payment Part {k+1}"
                if k < len(amt_parts):
                    p_label += f" (Rs. {amt_parts[k].strip()})"
                draw_image_box(c, pp_paths[k], p_label, c1_x, sy, c1_w, slot_h, cache_dir)

            draw_image_box(c, bill_paths[0], 'Official Invoice / Bill Copy', c2_x, content_y, c2_w, content_h, cache_dir)

        elif len(pp_paths) == 1 and len(bill_paths) == 1:
            # 1 PP + 1 Bill
            draw_image_box(c, pp_paths[0], f"Payment Proof (Rs. {amt_exp})", col1_x, content_y, col_w, content_h, cache_dir)
            draw_image_box(c, bill_paths[0], "Softcopy Bill / Tax Invoice", col2_x, content_y, col_w, content_h, cache_dir)

        elif len(pp_paths) >= 2 and len(bill_paths) == 1:
            # 2 PP stacked + 1 Bill
            slot_h = (content_h - 8) / 2
            p1_amt = amt_parts[0] if len(amt_parts) > 0 else ''
            p2_amt = amt_parts[1] if len(amt_parts) > 1 else ''

            draw_image_box(c, pp_paths[0], f"Payment Part 1 (Rs. {p1_amt})", col1_x, content_y + slot_h + 8, col_w, slot_h, cache_dir)
            draw_image_box(c, pp_paths[1], f"Payment Part 2 (Rs. {p2_amt})", col1_x, content_y, col_w, slot_h, cache_dir)
            draw_image_box(c, bill_paths[0], "Softcopy Bill / Tax Invoice", col2_x, content_y, col_w, content_h, cache_dir)

        elif len(pp_paths) == 1 and len(bill_paths) == 0:
            # 1 PP + NO Bill
            draw_image_box(c, pp_paths[0], f"Payment Proof (Rs. {amt_exp})", col1_x, content_y, col_w, content_h, cache_dir)
            draw_no_bill_notice(c, col2_x, content_y + content_h/3, col_w, content_h/3, row.get('remark', ''))

        elif len(pp_paths) >= 2 and len(bill_paths) == 0:
            # 2 PP + NO Bill
            p1_amt = amt_parts[0] if len(amt_parts) > 0 else ''
            p2_amt = amt_parts[1] if len(amt_parts) > 1 else ''
            draw_image_box(c, pp_paths[0], f"Payment Part 1 (Rs. {p1_amt})", col1_x, content_y, col_w, content_h, cache_dir)
            draw_image_box(c, pp_paths[1], f"Payment Part 2 (Rs. {p2_amt})", col2_x, content_y, col_w, content_h, cache_dir)

        elif len(pp_paths) == 0 and len(bill_paths) >= 1:
            # Only Bill (e.g. Cash / Company account)
            draw_image_box(c, bill_paths[0], "Softcopy Bill / Tax Invoice", col1_x, content_y, content_w, content_h, cache_dir)

        else:
            # Neither image attached
            draw_no_bill_notice(c, col1_x, content_y + content_h/3, content_w, content_h/3, row.get('remark', ''))

        c.showPage()

    c.save()
    return output_path
