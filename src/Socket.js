/**
 * @typedef T_SocketRequestInstance
 * @property {import('./Request')} requestdata
 * @property {number} timeout
 * @property {function} resolve
 * @property {function} reject
 */

const EventEmitter = require('events');

const Request = require('./Request');
const Response = require('./Response');
const Status = require('./Status');

module.exports = class Socket {

  /**
   * @param {import('./Server')} server
   * @param {import('socket.io').Socket} realsocket
   * @param {string} type
   * @param {string} uuid
   */
  constructor(server, realsocket, type, uuid = null) {
    this._server = server;
    this._realsocket = realsocket;
    this._meta = { type, uuid: null };
    this._requests = {};
    this._components = {};
    this._events = new EventEmitter();

    this.uuid = uuid;
    this.init();
  }

  /**
   * @returns {import('./Server')}
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

  /**
   * @returns {import('events').EventEmitter}
   */
  get events() {
    return this._events;
  }

  register(name, component) {
    this._components[name] = component;
    return this;
  }

  init() {
    this.realsocket.on('request', this.doRequest.bind(this));
    this.realsocket.on('response', this.doResponse.bind(this));
    this.realsocket.on('uuid', this.doUUID.bind(this));
    this.realsocket.on('event', this.doEvent.bind(this));

    if (this.uuid !== null) {
      this.realsocket.emit('uuid', { uuid: this.uuid, type: this.meta.type });
    }
  }

  trigger(event, params) {
    this.realsocket.emit('server.event', { event, params, sender: this.uuid });
  }

  /**
   * @param {string} route
   * @param {Object} params
   * @returns {Promise<import('./Response')>}
   */
  request(route, params = {}) {
    const request = Request.create(this, route, params);

    return this.sendRequest(request);
  }

  /**
   * @param {import('./Request')} request
   * @returns {Promise<import('./Response')>}
   */
  sendRequest(request) {
    return new Promise((resolve, reject) => {
      this.requests[request.uuid] = { request, resolve, reject, timeout: null };
      if (this.server.options.timeout !== 0) {
        this.requests[request.uuid].timeout = setTimeout(this.doTimeout.bind(this.requests[request.uuid]), this.server.options.timeout);
      }
      this.realsocket.emit('request', request.requestdata);
    });
  }

  /**
   * @param {import('./Request')} request
   * @param {object} data
   * @param {number} status
   */
  response(request, data, status = Status.RESPONSE_OK) {
    const response = Response.create(this, request, data, status);

    this.sendResponse(response);
  }

  /**
   *
   * @param {import('./Response')} response
   */
  sendResponse(response) {
    this.realsocket.emit('response', response.responsedata);
  }

  /**
   * @param {string} uuid
   */
  doUUID({ uuid, type }) {
    let meta = {};
    if (this.server.sockets[uuid] !== undefined) {
      meta = this.server.sockets[uuid].meta;
    }
    delete this.server.sockets[uuid];
    this._meta = meta;
    this.uuid = uuid;
    this.meta.type = type;
    this.server.sockets[this.uuid] = this;
    this.server.doServerEvent('socket.connect', { meta: this.meta }, this);
  }

  /**
   * @param {T_SocketRequest} requestdata
   */
  doRequest(requestdata) {
    const request = new Request(this, requestdata);

    this.server.handle(request).catch((e) => { });
  }

  /**
   * @param {T_SocketResponse} responsedata
   */
  doResponse(responsedata) {
    const response = new Response(this, responsedata);

    if (this.requests[response.requestdata.uuid] !== undefined) {
      if (this.requests[response.requestdata.uuid].timeout !== null) {
        clearTimeout(this.requests[response.requestdata.uuid].timeout);
      }
      this.requests[response.requestdata.uuid].resolve(response);
      delete this.requests[response.requestdata.uuid];
    }
  }

  doTimeout() {
    this.resolve(Response.create(this.request.socket, this.request, {}, Status.RESPONSE_ERROR | Status.RESPONSE_TIMEOUT));
  }

  doEvent({ event, sender, params }) {
    this.events.emit(event, sender, params);
  }

}
