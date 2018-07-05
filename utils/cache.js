export default class Cache {
  constructor() {
    this.data = Object.create(null);
  }
  get(key) {
    return this.data[key];
  }
  set(key, value) {
    this.data[key] = value;
  }
  del() {
    delete this.data[key];
  }
  has(key) {
    return key in this.data;
  }
}