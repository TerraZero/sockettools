/**
 * @typedef T_SocketMeta
 * @property {string} uuid
 */

/**
 * @typedef T_SocketRequest
 * @property {string} uuid
 * @property {string} socket_uuid
 * @property {string} route
 * @property {object} params
 */

/**
 * @typedef T_SocketResponse
 * @property {T_SocketRequest} requestdata
 * @property {object} data
 * @property {number} status
 */

/**
 * @typedef T_SocketRequestInstance
 * @property {import('./Request').default} requestdata
 * @property {function} resolve
 * @property {function} reject
 */
