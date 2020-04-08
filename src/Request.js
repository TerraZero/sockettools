import { v4 as UUID } from 'uuid';

export default class Request {

  /**
   * @param {import('./Socket').default} socket
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
   * @param {import('./Socket').default} socket
   * @param {T_SocketRequest} requestdata
   */
  constructor(socket, requestdata) {
    this._socket = socket;
    this._requestdata = requestdata;
  }

  /**
   * @returns {import('./Socket').default}
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
