const UUID = require('uuid').v4;

module.exports = class Request {

  /**
   * @param {import('./Socket')} socket
   * @param {string} route
   * @param {object} params
   */
  static create(socket, route, params = {}) {
    return new Request(socket, {
      uuid: UUID(),
      socket_uuid: socket.uuid,
      route: route,
      params: params,
    });
  }

  /**
   * @param {import('./Socket')} socket
   * @param {T_SocketRequest} requestdata
   */
  constructor(socket, requestdata) {
    this._socket = socket;
    this._requestdata = requestdata;
  }

  /**
   * @returns {import('./Socket')}
   */
  get socket() {
    return this._socket;
  }

  /**
   * @returns {T_SocketRequest}
   */
  get requestdata() {
    return this._requestdata;
  }

  /**
   * @returns {string}
   */
  get uuid() {
    return this.requestdata.uuid;
  }

  /**
   * @returns {string}
   */
  get socketUUID() {
    return this.requestdata.socket_uuid;
  }

  /**
   * @returns {string}
   */
  get route() {
    return this.requestdata.route;
  }

  /**
   * @returns {object}
   */
  get params() {
    return this.requestdata.params;
  }

}
