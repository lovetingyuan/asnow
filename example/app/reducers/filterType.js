export default class filterTypeReducer {
  static state = 'all';

  changeType(newType) {
    return newType || 'all';
  }
}
