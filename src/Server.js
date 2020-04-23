/**
 * @typedef T_ServerOptions
 * @property {number} timeout
 */

const UUID = require('uuid').v4;

const Status = require('./Status');
const Cookie = require('./Cookie');
const Socket = require('./Socket');

module.exports = class Server {

  constructor() {
    this._controllers = [];
    this._sockets = {};
    this._realsocket = null;
    this._options = {
      timeout: 1000,
    };
  }

  /**
   * @returns {import('./Controller')[]}
   */
  get controllers() {
    return this._controllers;
  }

  /**
   * @returns {import('socket.io').Socket}
   */
  get realsocket() {
    return this._realsocket;
  }

  /**
   * @returns {Object<string, import('./Socket')>}
   */
  get sockets() {
    return this._sockets;
  }

  /**
   * @returns {T_ServerOptions}
   */
  get options() {
    return this._options;
  }

  /**
   * @param {string} type
   * @returns {object<string, import('./Socket')>}
   */
  getSockets(type) {
    const sockets = {};

    for (const uuid in this.sockets) {
      if (this.sockets[uuid].meta.type === type) {
        sockets[uuid] = this.sockets[uuid];
      }
    }
    return sockets;
  }

  /**
   *
   * @param {import('./Controller')} controller
   */
  addController(controller) {
    this._controllers.push(controller);
  }

  /**
   * @param {import('./Request')} request
   * @returns {Promise}
   */
  handle(request) {
    for (const controller of this.controllers) {
      if (controller.hasHandle(request)) {
        return controller.execute(request);
      }
    }
    request.socket.response(request, {}, Status.RESPONSE_ERROR | Status.RESPONSE_NOT_RESOLVED);
    return Promise.reject('No handle found');
  }

  /**
   * @param {object<string, import('./Socket')>} sockets
   * @param {string} route
   * @param {Object} params
   * @returns {Promise<import('./Response')>[]}
   */
  broadcast(sockets, route, params = {}) {
    sockets = sockets || this.sockets;
    const promises = [];

    for (const uuid in sockets) {
      promises.push(sockets[uuid].request(route, params));
    }
    return promises;
  }

  /**
   * @param {string} event
   * @param {object} params
   * @param {import('./Socket')} socket
   */
  doServerEvent(event, params, socket = null) {
    if (socket !== null) {
      socket.events.emit(event, { event, params, sender: socket.uuid });
    }
    this.realsocket.emit('event', { event, params, sender: socket.uuid });
  }

  /**
   * @param {import('socket.io').Server} server
   * @returns {this}
   */
  createServer(server) {
    this._realsocket = server;
    this.realsocket.on('connection', (realsocket) => {
      const socket = new Socket(this, realsocket);

      realsocket.on('server.event', ({ event, params }) => {
        this.doServerEvent(event, params, socket);
      });

      realsocket.on('disconnect', () => {
        if (socket.uuid !== null) {
          delete this.sockets[socket.uuid];
          this.doServerEvent('socket.disconnect', {}, socket);
        }
      });
    });
    return this;
  }

  /**
   * @param {import('socket.io-client')} client
   * @param {string} type
   * @param {boolean} remindme
   * @returns {import('./Socket')}
   */
  createClient(client, type = 'client', remindme = true) {
    let uuid = UUID();
    if (typeof document !== 'undefined' && remindme) {
      if (Cookie.exists('pencl')) {
        uuid = Cookie.get('pencl');
      }
      Cookie.set('pencl', uuid);
    }
    return new Socket(this, client, type, uuid + '-' + this.getSiteHash());
  }

  getSiteHash() {
    if (window && window.location) {
      return this.getHash(window.location.href);
    }
    return 0;
  }

  getHash(string) {
    let hash = 0;
    if (string.length == 0) {
      return hash;
    }
    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

}
