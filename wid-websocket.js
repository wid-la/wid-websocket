'use strict';

(function () {

  Polymer({

    is: 'wid-websocket',

    properties: {
      url: {
        type: String
      },

      auto: {
        type: Boolean,
        value: false
      },

      json: {
        type: Boolean,
        value: false
      },

      _ws: {
        type: Object
      },

      _promise: {
        type: Object
      }
    },

    observers: ['_urlChanged(url, auto)'],

    readyState: function readyState() {
      if (this._ws) {
        return this._ws.readyState;
      } else {
        return -1;
      }
    },

    open: function open() {
      this._connect();
    },

    send: function send(data) {
      var _this = this;

      if (!this._ws) {
        throw new Error('wid-websocket.send(...): not connected.');
      }
      if (this.json) {
        data = JSON.stringify(data);
      }
      this._promise.then(function () {
        _this._ws.send(data);
      });
    },

    close: function close(code, reason) {
      if (this._ws) {
        this._ws.close(code, reason);
        this._ws = null;
      }
    },

    _urlChanged: function _urlChanged() {
      if (this.auto) {
        this._connect();
      }
    },

    _connect: function _connect() {
      var _this2 = this;

      if (!this.url) {
        throw new Error('wid-websocket.connect(...): no url.');
      }
      if (this._ws) {
        throw new Error('wid-websocket.connect(...): already connected.');
      }

      this._promise = new Promise(function (resolve, reject) {
        _this2._ws = new WebSocket(_this2.url);
        _this2._ws.onopen = _this2._onwsopen.bind(_this2, resolve);
        _this2._ws.onerror = _this2._onwserror.bind(_this2, reject);
        _this2._ws.onmessage = _this2._onwsmessage.bind(_this2);
        _this2._ws.onclose = _this2._onwsclose.bind(_this2);
      });
    },

    _onwsopen: function _onwsopen(cb) {
      this.fire('open');
      cb(this.readyState);
    },

    _onwserror: function _onwserror(cb) {
      this.fire('error');
      cb(this.readyState);
    },

    _onwsmessage: function _onwsmessage(event) {
      var data = event.data;
      if (this.json) {
        data = JSON.parse(data);
      }
      this.fire('message', { data: data });
    },

    _onwsclose: function _onwsclose(event) {
      this.fire('error', { code: event.code, reason: event.reason });
    }

  });
})();