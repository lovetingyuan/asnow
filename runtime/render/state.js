export default class State {
  constructor(data = {}) {
    Object.defineProperties(this, {
      _data: {
        value: data
      },
      _deps: {
        writable: true,
        value: {}
      }
    });
    const self = this;
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          self.addDep(key);
          return self._data[key];
        },
        set(value) {
          self._data[key] = value;
        }
      });
    });
  }
  addDep(key) {
    this._deps[key] = true;
  }
  clearDeps() {
    this._deps = {};
  }
  getDeps(clear) {
    const deps = this._deps;
    if (clear) {
      this._deps = {};
    }
    return deps;
  }
  getData() {
    return this._data;
  }
  getState(clear) {
    if (clear) {
      this._deps = {};
    }
    return this;
  }
  setState(newData = {}) {
    Object.keys(newData).forEach(key => {
      this[key] = newData[key];
    });
  }
  _getStyle(val, style = '') {
    if (typeof val === 'object' && val) {
      val = Object.keys(val).map(key => `${key}: ${val[key]}`).join(';');
    }
    return style + val;
  }
  _getClassName(val, className = '') {
    if (typeof val === 'object' && val) {
      val = Object.keys(val).map(key => val[key] ? key : '').join(' ');
    }
    return className + val;
  }
}
