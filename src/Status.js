module.exports = class SocketStatus {

  static get RESPONSE_OK() {
    return 1;
  }

  static get RESPONSE_ERROR() {
    return 2;
  }

  static get RESPONSE_EMPTY() {
    return 4;
  }

  static get RESPONSE_NOT_RESOLVED() {
    return 8;
  }

  static get RESPONSE_TIMEOUT() {
    return 16;
  }

  /**
   * @param {number} status
   * @param {number} compare
   * @returns {boolean}
   */
  static isStatus(status, compare) {
    return (status & compare) === compare;
  }

  /**
   * @param {number} status
   * @returns {string[]}
   */
  static extract(status) {
    const extracted = [];

    for (const field of Object.getOwnPropertyNames(this)) {
      if (field.startsWith('RESPONSE') && typeof this[field] === 'number' && this.isStatus(status, this[field])) {
        extracted.push(field);
      }
    }
    return extracted;
  }

}
