'use strict';

(function () {

  var _ws = {},
      // map of websockets indexed by the url of the websocket
  _promises = {}; // we open only one websocket to a server

  function noop() {}

  Polymer({

    is: 'wid-websocket',

    properties: {
      /**
       * The websocket server url
       * @type {String}
       */
      url: {
        type: String
      },

      /**
       * Whether the component should connect right away to the websocket server if url is specified.
       * @type {Boolean}
       */
      auto: {
        type: Boolean,
        value: false
      },

      /**
       * Wheter the data sent and received is JSON
       * @type {Boolean}
       */
      json: {
        type: Boolean,
        value: false
      }
    },

    observers: ['_urlChanged(url, auto)'],

    /**
     * Return the status of the WS depending on the url of the component.
     * @return {Number} WS status
     */
    readyState: function readyState() {
      if (_ws[this.url]) {
        return _ws[this.url].readyState;
      } else {
        return -1;
      }
    },

    /**
     * Open the websocket connexion
     */
    open: function open() {
      this._connect();
    },

    /**
     * Send data through the websocket. If the websocket is not yet opened. We wait for it.
     * @param  {Object} data Data to send.
     */
    send: function send(data) {
      var _this = this;

      if (!_ws[this.url]) {
        throw new Error('wid-websocket.send(...): not connected for ' + this.url + '.');
      }
      if (this.json) {
        data = JSON.stringify(data);
      }
      _promises[this.url].then(function () {
        _ws[_this.url].send(data);
      });
    },

    /**
     * Close the WS
     * @param  {Number} code   Code
     * @param  {String} reason Reason
     */
    close: function close(code, reason) {
      if (_ws[this.url]) {
        _ws[this.url].close(code, reason);
        _ws[this.url] = null;
      }
    },

    /**
     * Executed if the url has changed. If auto is true, try to open the websocket
     */
    _urlChanged: function _urlChanged() {
      if (this.auto) {
        this._connect();
      }
    },

    /**
     * Connect the websocket to the server
     */
    _connect: function _connect() {
      var _this2 = this;

      if (!this.url) {
        throw new Error('wid-websocket.connect(...): no url.');
      }
      if (_ws[this.url]) {

        var ws = _ws[this.url];
        ws.addEventListener('open', this._onwsopen.bind(this, noop));
        ws.addEventListener('error', this._onwserror.bind(this, noop));
        ws.addEventListener('message', this._onwsmessage.bind(this));
        ws.addEventListener('close', this._onwsclose.bind(this));
      } else {
        _promises[this.url] = new Promise(function (resolve, reject) {

          var ws = _ws[_this2.url] = new WebSocket(_this2.url);

          ws.addEventListener('open', _this2._onwsopen.bind(_this2, resolve));
          ws.addEventListener('error', _this2._onwserror.bind(_this2, reject));
          ws.addEventListener('message', _this2._onwsmessage.bind(_this2));
          ws.addEventListener('close', _this2._onwsclose.bind(_this2));
        });
      }
    },

    /**
     * Executed when the websocket is openend
     * @param  {Function} cb Callback for promise resolution
     */
    _onwsopen: function _onwsopen(cb) {
      this.fire('open');
      cb(this.readyState);
    },

    /**
     * Executed when the websocket has an error
     * @param  {Function} cb Callback for promise resolution
     */
    _onwserror: function _onwserror(cb) {
      this.fire('error');
      cb(this.readyState);
    },

    /**
     * Executed when the WS receives some data.
     * @param  {MessageEvent} event Message event
     */
    _onwsmessage: function _onwsmessage(event) {
      var data = event.data;
      if (this.json) {
        data = JSON.parse(data);
      }
      this.fire('message', { data: data });
    },

    /**
     * Executed when the websocket closes
     * @param  {CloseEvent} event Close Event
     */
    _onwsclose: function _onwsclose(event) {
      this.fire('error', { code: event.code, reason: event.reason });
    }

  });
})();