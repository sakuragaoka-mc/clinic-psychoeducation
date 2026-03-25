/**
 * SakuraStorage - localStorage抽象化レイヤー
 * こころのクリニック桜が丘 Webアプリ共通
 */
const SakuraStorage = {
  PREFIX: 'sakura_',

  _key(key) {
    return this.PREFIX + key;
  },

  get(key) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  append(key, item) {
    const arr = this.get(key) || [];
    arr.push(item);
    return this.set(key, arr);
  },

  update(key, id, patch) {
    const arr = this.get(key) || [];
    const idx = arr.findIndex(item => item.id === id);
    if (idx === -1) return false;
    arr[idx] = { ...arr[idx], ...patch };
    return this.set(key, arr);
  },

  remove(key, id) {
    const arr = this.get(key) || [];
    const filtered = arr.filter(item => item.id !== id);
    return this.set(key, filtered);
  },

  clear(key) {
    try {
      localStorage.removeItem(this._key(key));
      return true;
    } catch {
      return false;
    }
  },

  exportCSV(key, headers) {
    const arr = this.get(key) || [];
    if (arr.length === 0) return '';

    const cols = headers || Object.keys(arr[0]);
    const headerRow = cols.join(',');
    const rows = arr.map(item =>
      cols.map(col => {
        const val = item[col];
        if (val === null || val === undefined) return '';
        const str = Array.isArray(val) ? val.join('; ') : String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? '"' + str.replace(/"/g, '""') + '"'
          : str;
      }).join(',')
    );

    return headerRow + '\n' + rows.join('\n');
  },

  downloadCSV(key, filename, headers) {
    const csv = this.exportCSV(key, headers);
    if (!csv) return false;

    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || key + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  },

  getStorageUsage() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(this.PREFIX)) {
        total += k.length + localStorage.getItem(k).length;
      }
    }
    return {
      bytes: total * 2,
      kb: Math.round((total * 2) / 1024),
      percentUsed: Math.round((total * 2) / (5 * 1024 * 1024) * 100)
    };
  }
};
