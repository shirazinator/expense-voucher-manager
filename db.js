/**
 * IndexedDB Local Database Engine (Version 2)
 * Manages both:
 * 1. Expenses & Softcopy Bills
 * 2. Company Advances / Funds Received
 * 
 * 100% private to the user's browser / phone storage.
 * Zero data sent to any server.
 * Developed by Shiraz Khan
 */

const DB_NAME = 'ExpenseVoucherDB';
const DB_VERSION = 2;

class ExpenseDB {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        // ObjectStore 1: Expenses
        if (!db.objectStoreNames.contains('expenses')) {
          const store = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('category', 'category', { unique: false });
        }
        // ObjectStore 2: Company Advances / Funds Received
        if (!db.objectStoreNames.contains('funds')) {
          const fundStore = db.createObjectStore('funds', { keyPath: 'id', autoIncrement: true });
          fundStore.createIndex('date', 'date', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error('IndexedDB Error:', e.target.error);
        reject(e.target.error);
      };
    });
  }

  parseAmount(expressionStr) {
    if (typeof expressionStr === 'number') return expressionStr;
    const cleanStr = String(expressionStr || '0')
      .replace(/₹/g, '')
      .replace(/Rs\.?/gi, '')
      .trim();
    const parts = cleanStr.split('+');
    let total = 0.0;
    for (const p of parts) {
      const num = parseFloat(p.trim());
      if (!isNaN(num)) total += num;
    }
    return Math.round(total * 100) / 100;
  }

  // ================= EXPENSES =================

  async addExpense(data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('expenses', 'readwrite');
      const store = tx.objectStore('expenses');

      const total = this.parseAmount(data.amountExpression || data.amount);

      const record = {
        date: data.date,
        description: data.description,
        category: data.category || 'Food',
        amountExpression: String(data.amountExpression || data.amount || '0'),
        amountTotal: total,
        paidBy: data.paidBy || 'Shiraz',
        remark: data.remark || '',
        payments: data.payments || [], // Array of { name, blob, mimeType }
        bills: data.bills || [],       // Array of { name, blob, mimeType }
        createdAt: new Date().toISOString()
      };

      const req = store.add(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async updateExpense(id, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('expenses', 'readwrite');
      const store = tx.objectStore('expenses');

      const total = this.parseAmount(data.amountExpression || data.amountTotal);
      const record = {
        id: Number(id),
        date: data.date,
        description: data.description,
        category: data.category || 'Food',
        amountExpression: String(data.amountExpression || '0'),
        amountTotal: total,
        paidBy: data.paidBy || 'Shiraz',
        remark: data.remark || '',
        payments: data.payments || [],
        bills: data.bills || [],
        updatedAt: new Date().toISOString()
      };

      const req = store.put(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteExpense(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('expenses', 'readwrite');
      const store = tx.objectStore('expenses');
      const req = store.delete(Number(id));
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllExpenses(startDate = null, endDate = null, category = 'all', search = '') {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('expenses', 'readonly');
      const store = tx.objectStore('expenses');
      const req = store.getAll();

      req.onsuccess = () => {
        let list = req.result || [];

        // Sort by date then ID
        list.sort((a, b) => {
          if (a.date === b.date) return (a.id || 0) - (b.id || 0);
          return a.date.localeCompare(b.date);
        });

        // Filter
        if (startDate) {
          list = list.filter(e => e.date >= startDate);
        }
        if (endDate) {
          list = list.filter(e => e.date <= endDate);
        }
        if (category && category.toLowerCase() !== 'all') {
          list = list.filter(e => e.category.toLowerCase() === category.toLowerCase());
        }
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(e => 
            (e.description && e.description.toLowerCase().includes(s)) ||
            (e.remark && e.remark.toLowerCase().includes(s)) ||
            (e.paidBy && e.paidBy.toLowerCase().includes(s))
          );
        }

        resolve(list);
      };

      req.onerror = () => reject(req.error);
    });
  }

  // ================= COMPANY ADVANCES / FUNDS RECEIVED =================

  async addFund(data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('funds', 'readwrite');
      const store = tx.objectStore('funds');

      const total = this.parseAmount(data.amountExpression || data.amount);

      const record = {
        date: data.date,
        source: data.source || 'Company Advance',
        amountExpression: String(data.amountExpression || data.amount || '0'),
        amountTotal: total,
        remark: data.remark || '',
        payments: data.payments || [], // Array of { name, blob, mimeType } (e.g. Bank credit screenshot)
        createdAt: new Date().toISOString()
      };

      const req = store.add(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteFund(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('funds', 'readwrite');
      const store = tx.objectStore('funds');
      const req = store.delete(Number(id));
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllFunds(startDate = null, endDate = null, search = '') {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('funds', 'readonly');
      const store = tx.objectStore('funds');
      const req = store.getAll();

      req.onsuccess = () => {
        let list = req.result || [];

        list.sort((a, b) => {
          if (a.date === b.date) return (a.id || 0) - (b.id || 0);
          return a.date.localeCompare(b.date);
        });

        if (startDate) {
          list = list.filter(f => f.date >= startDate);
        }
        if (endDate) {
          list = list.filter(f => f.date <= endDate);
        }
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(f => 
            (f.source && f.source.toLowerCase().includes(s)) ||
            (f.remark && f.remark.toLowerCase().includes(s))
          );
        }

        resolve(list);
      };

      req.onerror = () => reject(req.error);
    });
  }

  // ================= GENERAL =================

  async clearAll() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['expenses', 'funds'], 'readwrite');
      tx.objectStore('expenses').clear();
      tx.objectStore('funds').clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
}

window.appDB = new ExpenseDB();
