const Status = require('./Status');

module.exports = class Response {

  /**
   * @param {import('./Socket')} socket
   * @param {import('./Request')} request
   * @param {object} data
   * @param {number} status
   * @returns {Response}
   */
  static create(socket, request, data = null, status = Status.RESPONSE_OK) {
    return new Response(socket, {
      requestdata: request.requestdata,
      data: data,
      status: status,
    });
  }

  /**
   * @param {import('./Socket')} socket
   * @param {T_SocketResponse} responsedata
   */
  constructor(socket, responsedata) {
    this._socket = socket;
    this._responsedata = responsedata;
  }

  /**
   * @returns {import('./Socket')}
   */
  get socket() {
    return this._socket;
  }

  /**
   * @returns {T_SocketResponse}
   */
  get responsedata() {
    return this._responsedata;
  }

  /**
   * @returns {T_SocketRequest}
   */
  get requestdata() {
    return this.responsedata.requestdata;
  }

  /**
   * @returns {object}
   */
  get data() {
    return this.responsedata.data;
  }

  /**
   * @returns {number}
   */
  get status() {
    return this.responsedata.status;
  }

  isOK() {
    return Status.isStatus(this.status, Status.RESPONSE_OK);
  }

  isError() {
    return Status.isStatus(this.status, Status.RESPONSE_ERROR);
  }

}
