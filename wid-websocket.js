'use strict';

(function () {

  var _ws = undefined,
      _promise = undefined; // the websocket is global for the component.

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
      }
    },

    observers: ['_urlChanged(url, auto)'],

    readyState: function readyState() {
      if (_ws) {
        return _ws.readyState;
      } else {
        return -1;
      }
    },

    open: function open() {
      this._connect();
    },

    send: function send(data) {
      if (!_ws) {
        throw new Error('wid-websocket.send(...): not connected.');
      }
      if (this.json) {
        data = JSON.stringify(data);
      }
      _promise.then(function () {
        _ws.send(data);
      });
    },

    close: function close(code, reason) {
      if (_ws) {
        _ws.close(code, reason);
        _ws = null;
      }
    },

    _urlChanged: function _urlChanged() {
      if (this.auto) {
        this._connect();
      }
    },

    _connect: function _connect() {
      var _this = this;

      if (!this.url) {
        throw new Error('wid-websocket.connect(...): no url.');
      }
      if (_ws) {
        throw new Error('wid-websocket.connect(...): already connected.');
      }

      _promise = new Promise(function (resolve, reject) {
        _ws = new WebSocket(_this.url);
        _ws.onopen = _this._onwsopen.bind(_this, resolve);
        _ws.onerror = _this._onwserror.bind(_this, reject);
        _ws.onmessage = _this._onwsmessage.bind(_this);
        _ws.onclose = _this._onwsclose.bind(_this);
      });
    },

    _onwsopen: function _onwsopen(cb) {
      this.fire('wid-websocket-open');
      cb(this.readyState);
    },

    _onwserror: function _onwserror(cb) {
      this.fire('wid-websocket-error');
      cb(this.readyState);
    },

    _onwsmessage: function _onwsmessage(event) {
      var data = event.data;
      if (this.json) {
        data = JSON.parse(data);
      }
      this.fire('wid-websocket-message', { data: data });
    },

    _onwsclose: function _onwsclose(event) {
      this.fire('wid-websocket-error', { code: event.code, reason: event.reason });
    }

  });
})();