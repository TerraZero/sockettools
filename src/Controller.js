const Status = require('./Status');
const Response = require('./Response');

module.exports = class Controller {

  /**
   * @param {import('./Server')} server
   */
  constructor(server) {
    this._server = server;

    this._handles = {};
    this.register();
  }

  /**
   * @returns {import('./Server')}
   */
  get server() {
    return this._server;
  }

  register() { }

  /**
   * @param {string} request
   * @param {function} func
   * @returns {this}
   */
  addHandle(request, func = null) {
    this._handles[request] = func || this[request];
    return this;
  }

  /**
   * @param {import('./Request')} request
   */
  hasHandle(request) {
    return this._handles[request.route] !== undefined;
  }

  /**
   * @param {import('./Request')} request
   */
  async execute(request) {
    const data = await this._handles[request.route].call(this, request);

    if (data === undefined) {
      request.socket.response(request, {}, Status.RESPONSE_OK | Status.RESPONSE_EMPTY);
    } else if (data instanceof Response) {
      request.socket.sendResponse(data);
    } else {
      request.socket.response(request, data);
    }
  }

}
