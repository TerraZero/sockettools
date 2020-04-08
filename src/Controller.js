import Status from './Status';
import Response from './Response';

export default class Controller {

  /**
   * @param {import('./Server').default} server
   */
  constructor(server) {
    this._server = server;

    this._handles = {};
    this.register();
  }

  /**
   * @returns {import('./Server').default}
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
   * @param {import('./Request').default} request
   */
  hasHandle(request) {
    return this._handles[request.route] !== undefined;
  }

  /**
   * @param {import('./Request').default} request
   */
  async execute(request) {
    const data = await this._handles[request.route].call(this, request);

    if (data instanceof Response) {
      request.socket.sendResponse(data);
    } else if (data === undefined) {
      request.socket.response(request, {}, Status.RESPONSE_OK | Status.RESPONSE_EMPTY);
    } else {
      request.socket.response(request, data);
    }
  }

}
