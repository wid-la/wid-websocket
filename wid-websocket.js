'use strict';

(function () {

  var _ws = {},
      // map of websockets indexed by the url of the websocket
  _promises = {}; // we open only one websocket to a server

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
      if (_ws[this.url]) {
        return _ws[this.url].readyState;
      } else {
        return -1;
      }
    },

    open: function open() {
      this._connect();
    },

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

    close: function close(code, reason) {
      if (_ws[this.url]) {
        _ws[this.url].close(code, reason);
        _ws[this.url] = null;
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
      if (_ws[this.url]) {
        return this.readyState();
        // throw new Error(`wid-websocket.connect(...): already connected for ${this.url}.`);
      }

      _promises[this.url] = new Promise(function (resolve, reject) {
        var ws = _ws[_this2.url] = new WebSocket(_this2.url);

        ws.onopen = _this2._onwsopen.bind(_this2, resolve);
        ws.onerror = _this2._onwserror.bind(_this2, reject);
        ws.onmessage = _this2._onwsmessage.bind(_this2);
        ws.onclose = _this2._onwsclose.bind(_this2);
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