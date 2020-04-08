import { v4 as UUID } from 'uuid';

import Cookie from './Cookie';
import Socket from './Socket';

export default class Server {

  constructor() {
    this._controllers = [];
    this._sockets = {};
    this._realsocket = null;
  }

  /**
   * @returns {import('./Controller').default[]}
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
   * @returns {Object<string, import('./Socket').default>}
   */
  get sockets() {
    return this._sockets;
  }

  /**
   *
   * @param {import('./Controller').default} controller
   */
  addController(controller) {
    this._controllers.push(controller);
  }

  /**
   * @param {import('./Request').default} request
   * @returns {Promise}
   */
  handle(request) {
    for (const controller of this.controllers) {
      if (controller.hasHandle(request)) {
        return controller.execute(request);
      }
    }
    return Promise.reject('No handle found');
  }

  /**
   * @param {import('./Socket').default[]} sockets
   * @param {string} route
   * @param {Object} params
   * @returns {Promise<import('./Response').default>[]}
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
   * @param {import('socket.io').Server} server
   * @returns {this}
   */
  createServer(server) {
    this._realsocket = server;
    this.realsocket.on('connection', (realsocket) => {
      new Socket(this, realsocket);
    });
    return this;
  }

  /**
   * @param {import('socket.io-client')} client
   * @returns {import('./Socket').default}
   */
  createClient(client) {
    let uuid = null;
    if (Cookie.exists('pencl')) {
      uuid = Cookie.get('pencl');
    } else {
      uuid = UUID();
    }
    Cookie.set('pencl', uuid);
    return new Socket(this, client, uuid);
  }

}
