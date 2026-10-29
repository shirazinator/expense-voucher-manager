import os
import io
import zipfile
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_file, send_from_directory
from werkzeug.utils import secure_filename

import database
from pdf_generator import generate_pdf_report
from excel_generator import generate_excel_report

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_PAYMENTS = os.path.join(BASE_DIR, 'data', 'uploads', 'payments')
UPLOAD_BILLS = os.path.join(BASE_DIR, 'data', 'uploads', 'bills')
CACHE_DIR = os.path.join(BASE_DIR, 'data', 'cache')
EXPORTS_DIR = os.path.join(BASE_DIR, 'data', 'exports')

os.makedirs(UPLOAD_PAYMENTS, exist_ok=True)
os.makedirs(UPLOAD_BILLS, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)

# Initialize database
database.init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/uploads/payments/<filename>')
def serve_payment_file(filename):
    return send_from_directory(UPLOAD_PAYMENTS, filename)

@app.route('/uploads/bills/<filename>')
def serve_bill_file(filename):
    return send_from_directory(UPLOAD_BILLS, filename)

@app.route('/api/expenses', methods=['GET'])
def list_expenses():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    category = request.args.get('category')
    search = request.args.get('search')

    expenses = database.get_expenses(start_date=start_date, end_date=end_date, category=category, search=search)
    
    # Format attachments relative URL
    for e in expenses:
        for p in e.get('payments', []):
            p['url'] = f"/uploads/payments/{os.path.basename(p['file_path'])}"
        for b in e.get('bills', []):
            b['url'] = f"/uploads/bills/{os.path.basename(b['file_path'])}"

    total_amount = sum(e['amount_total'] for e in expenses)
    return jsonify({
        'expenses': expenses,
        'count': len(expenses),
        'total_amount': round(total_amount, 2)
    })

@app.route('/api/expenses', methods=['POST'])
def create_expense():
    date = request.form.get('date', datetime.now().strftime('%Y-%m-%d')).strip()
    description = request.form.get('description', '').strip()
    category = request.form.get('category', 'Food').strip()
    amount_expression = request.form.get('amount_expression', '0').strip()
    paid_by = request.form.get('paid_by', 'Shiraz').strip()
    remark = request.form.get('remark', '').strip()

    if not description:
        return jsonify({'error': 'Description is required'}), 400

    saved_payments = []
    payment_files = request.files.getlist('payments')
    for idx, f in enumerate(payment_files):
        if f and f.filename:
            fname = f"pay_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{idx}_{secure_filename(f.filename)}"
            fpath = os.path.join(UPLOAD_PAYMENTS, fname)
            f.save(fpath)
            saved_payments.append(fpath)

    saved_bills = []
    bill_files = request.files.getlist('bills')
    for idx, f in enumerate(bill_files):
        if f and f.filename:
            fname = f"bill_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{idx}_{secure_filename(f.filename)}"
            fpath = os.path.join(UPLOAD_BILLS, fname)
            f.save(fpath)
            saved_bills.append(fpath)

    expense_id = database.add_expense(
        date=date,
        description=description,
        category=category,
        amount_expression=amount_expression,
        paid_by=paid_by,
        remark=remark,
        payments=saved_payments,
        bills=saved_bills
    )

    created_item = database.get_expense_by_id(expense_id)
    return jsonify({'success': True, 'expense': created_item}), 201

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def remove_expense(expense_id):
    success = database.delete_expense(expense_id)
    return jsonify({'success': success})

@app.route('/api/export/pdf', methods=['GET'])
def export_pdf():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    category = request.args.get('category')
    search = request.args.get('search')

    expenses = database.get_expenses(start_date=start_date, end_date=end_date, category=category, search=search)
    if not expenses:
        return jsonify({'error': 'No expenses found for selected cycle'}), 404

    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    cycle_label = f"{start_date or 'all'}_to_{end_date or 'all'}"
    out_name = f"Expense_Vouchers_{cycle_label}_{ts}.pdf"
    out_path = os.path.join(EXPORTS_DIR, out_name)

    generate_pdf_report(expenses, out_path, cache_dir=CACHE_DIR)
    return send_file(out_path, as_attachment=True, download_name=out_name)

@app.route('/api/export/excel', methods=['GET'])
def export_excel():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    category = request.args.get('category')
    search = request.args.get('search')

    expenses = database.get_expenses(start_date=start_date, end_date=end_date, category=category, search=search)
    if not expenses:
        return jsonify({'error': 'No expenses found for selected cycle'}), 404

    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    cycle_label = f"{start_date or 'all'}_to_{end_date or 'all'}"
    out_name = f"Expense_Report_{cycle_label}_{ts}.xlsx"
    out_path = os.path.join(EXPORTS_DIR, out_name)

    generate_excel_report(expenses, out_path)
    return send_file(out_path, as_attachment=True, download_name=out_name)

@app.route('/api/export/zip', methods=['GET'])
def export_zip():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    category = request.args.get('category')
    search = request.args.get('search')

    expenses = database.get_expenses(start_date=start_date, end_date=end_date, category=category, search=search)
    if not expenses:
        return jsonify({'error': 'No expenses found for selected cycle'}), 404

    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    cycle_label = f"{start_date or 'all'}_to_{end_date or 'all'}"
    
    pdf_name = f"Expense_Vouchers_{cycle_label}.pdf"
    pdf_path = os.path.join(EXPORTS_DIR, pdf_name)
    generate_pdf_report(expenses, pdf_path, cache_dir=CACHE_DIR)

    xlsx_name = f"Expense_Report_{cycle_label}.xlsx"
    xlsx_path = os.path.join(EXPORTS_DIR, xlsx_name)
    generate_excel_report(expenses, xlsx_path)

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.write(pdf_path, arcname=pdf_name)
        zf.write(xlsx_path, arcname=xlsx_name)

        # Include raw images organized in folders
        for idx, e in enumerate(expenses):
            item_prefix = f"Voucher_{idx+1:02d}"
            for p_idx, p in enumerate(e.get('payments', [])):
                if os.path.exists(p.get('file_path', '')):
                    arc = f"Receipts/{item_prefix}_Payment_{p_idx+1}_{os.path.basename(p['file_path'])}"
                    zf.write(p['file_path'], arcname=arc)
            for b_idx, b in enumerate(e.get('bills', [])):
                if os.path.exists(b.get('file_path', '')):
                    arc = f"Receipts/{item_prefix}_Bill_{b_idx+1}_{os.path.basename(b['file_path'])}"
                    zf.write(b['file_path'], arcname=arc)

    zip_buffer.seek(0)
    zip_name = f"Expense_Bundle_{cycle_label}_{ts}.zip"
    return send_file(zip_buffer, as_attachment=True, download_name=zip_name, mimetype='application/zip')

if __name__ == '__main__':
    print("Starting Expense Voucher Manager on http://localhost:5050")
    app.run(host='0.0.0.0', port=5050, debug=True)
