import Request from './Request';
import Response from './Response';

export default class Socket {

  /**
   * @param {import('./Server').default} server
   * @param {import('socket.io').Socket} realsocket
   * @param {string} uuid
   */
  constructor(server, realsocket, uuid = null) {
    this._server = server;
    this._realsocket = realsocket;
    this._meta = {};
    this._requests = {};
    this._components = {};

    this.uuid = uuid;
    this.init();
  }

  /**
   * @returns {import('./Server').default}
   */
  get server() {
    return this._server;
  }

  /**
   * @returns {import('socket.io').Socket}
   */
  get realsocket() {
    return this._realsocket;
  }

  /**
   * @returns {T_SocketMeta}
   */
  get meta() {
    return this._meta;
  }

  /**
   * @returns {string}
   */
  get uuid() {
    return this.meta.uuid;
  }

  set uuid(value) {
    this.meta.uuid = value;
  }

  /**
   * @returns {Object<string, T_SocketRequestInstance>}
   */
  get requests() {
    return this._requests;
  }

  /**
   * @returns {object<string, any>}
   */
  get components() {
    return this._components;
  }

  register(name, component) {
    this._components[name] = component;
    return this;
  }

  init() {
    this.realsocket.on('request', this.doRequest.bind(this));
    this.realsocket.on('response', this.doResponse.bind(this));
    this.realsocket.on('uuid', this.doUUID.bind(this));

    if (this.uuid !== null) {
      this.realsocket.emit('uuid', this.uuid);
    }
  }

  /**
   * @param {string} route
   * @param {Object} params
   * @returns {Promise<import('./Response').default>}
   */
  request(route, params = {}) {
    const request = Request.create(this, route, params);

    return this.sendRequest(request);
  }

  /**
   * @param {import('./Request').default} request
   * @returns {Promise<import('./Response').default>}
   */
  sendRequest(request) {
    return new Promise((resolve, reject) => {
      this.requests[request.uuid] = { request, resolve, reject };
      this.realsocket.emit('request', request.requestdata);
    });
  }

  /**
   * @param {import('./Request').default} request
   * @param {object} data
   */
  response(request, data) {
    const response = Response.create(this, request, data);

    this.sendResponse(response);
  }

  /**
   *
   * @param {import('./Response').default} response
   */
  sendResponse(response) {
    this.realsocket.emit('response', response.responsedata);
  }

  /**
   * @param {string} uuid
   */
  doUUID(uuid) {
    let meta = {};
    if (this.server.sockets[uuid] !== undefined) {
      meta = this.server.sockets[uuid].meta;
    }
    delete this.server.sockets[uuid];
    this._meta = meta;
    this.uuid = uuid;
    this.server.sockets[this.uuid] = this;
  }

  /**
   * @param {T_SocketRequest} requestdata
   */
  doRequest(requestdata) {
    const request = new Request(this, requestdata);

    this.server.handle(request);
  }

  /**
   * @param {T_SocketResponse} responsedata
   */
  doResponse(responsedata) {
    const response = new Response(this, responsedata);

    if (this.requests[response.requestdata.uuid] !== undefined) {
      this.requests[response.requestdata.uuid].resolve(response);
      delete this.requests[response.requestdata.uuid];
    }
  }

}
