import sqlite3
import os
import re
from datetime import datetime

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, 'data', 'expenses.db')

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def parse_amount(expression_str):
    """Parses expressions like '141+10' or '279.83' into float sum."""
    clean_str = str(expression_str).replace('₹', '').replace('Rs.', '').strip()
    parts = clean_str.split('+')
    total = 0.0
    for p in parts:
        p_clean = re.sub(r'[^\d.]', '', p.strip())
        if p_clean:
            try:
                total += float(p_clean)
            except ValueError:
                pass
    return round(total, 2)

def init_db():
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            s_no INTEGER,
            date TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            amount_expression TEXT NOT NULL,
            amount_total REAL NOT NULL,
            paid_by TEXT DEFAULT 'Shiraz',
            remark TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expense_id INTEGER NOT NULL,
            attachment_type TEXT NOT NULL, -- 'payment' or 'bill'
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            display_order INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()

def add_expense(date, description, category, amount_expression, paid_by="Shiraz", remark="", payments=None, bills=None):
    total = parse_amount(amount_expression)
    conn = get_connection()
    c = conn.cursor()

    c.execute('SELECT COALESCE(MAX(s_no), 0) + 1 FROM expenses')
    next_s_no = c.fetchone()[0]

    c.execute('''
        INSERT INTO expenses (s_no, date, description, category, amount_expression, amount_total, paid_by, remark)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (next_s_no, date, description, category, amount_expression, total, paid_by, remark))
    expense_id = c.lastrowid

    if payments:
        for idx, p in enumerate(payments):
            c.execute('''
                INSERT INTO attachments (expense_id, attachment_type, file_name, file_path, display_order)
                VALUES (?, 'payment', ?, ?, ?)
            ''', (expense_id, os.path.basename(p), p, idx + 1))

    if bills:
        for idx, b in enumerate(bills):
            c.execute('''
                INSERT INTO attachments (expense_id, attachment_type, file_name, file_path, display_order)
                VALUES (?, 'bill', ?, ?, ?)
            ''', (expense_id, os.path.basename(b), b, idx + 1))

    conn.commit()
    conn.close()
    return expense_id

def get_expenses(start_date=None, end_date=None, category=None, search=None):
    conn = get_connection()
    c = conn.cursor()

    query = "SELECT * FROM expenses WHERE 1=1"
    params = []

    if start_date:
        query += " AND date >= ?"
        params.append(start_date)
    if end_date:
        query += " AND date <= ?"
        params.append(end_date)
    if category and category.lower() != 'all':
        query += " AND category = ?"
        params.append(category)
    if search:
        query += " AND (description LIKE ? OR remark LIKE ? OR paid_by LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s])

    query += " ORDER BY id ASC"
    c.execute(query, params)
    rows = c.fetchall()

    results = []
    for r in rows:
        item = dict(r)
        c.execute("SELECT * FROM attachments WHERE expense_id = ? ORDER BY attachment_type, display_order ASC", (item['id'],))
        atts = c.fetchall()
        item['payments'] = [dict(a) for a in atts if a['attachment_type'] == 'payment']
        item['bills'] = [dict(a) for a in atts if a['attachment_type'] == 'bill']
        results.append(item)

    conn.close()
    return results

def get_expense_by_id(expense_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM expenses WHERE id = ?", (expense_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return None
    item = dict(row)
    c.execute("SELECT * FROM attachments WHERE expense_id = ? ORDER BY attachment_type, display_order ASC", (item['id'],))
    atts = c.fetchall()
    item['payments'] = [dict(a) for a in atts if a['attachment_type'] == 'payment']
    item['bills'] = [dict(a) for a in atts if a['attachment_type'] == 'bill']
    conn.close()
    return item

def delete_expense(expense_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM attachments WHERE expense_id = ?", (expense_id,))
    c.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()
    return True
