/**
 * http://dailyjs.com/2014/09/04/cross-storage/
 */
CrossStorageClient = function(url, opts) {
    opts = opts || {};

    this._id        = CrossStorageClient._generateUUID();
    this._promise   = opts.promise || Promise;
    this._frameId   = opts.frameId || 'CrossStorageClient-' + this._id;
    this._origin    = CrossStorageClient._getOrigin(url);
    this._requests  = {};
    this._connected = false;
    this._closed    = false;
    this._count     = 0;
    this._timeout   = opts.timeout || 5000;
    this._listener  = null;

    this._installListener();

    var frame;
    if (opts.frameId) {
		frame = document.getElementById(opts.frameId);
    }

    // If using a passed iframe, poll the hub for a ready message
    if (frame) {
		this._poll();
    }

    // Create the frame if not found or specified
    frame = frame || this._createFrame(url);
    this._hub = frame.contentWindow;
}

CrossStorageClient.frameStyle = {
	display:  'none',
	position: 'absolute',
	top:      '-999px',
	left:     '-999px'
};

CrossStorageClient._getOrigin = function(url) {
    var uri, protocol, origin;

    uri = document.createElement('a');
    uri.href = url;

    if (!uri.host) {
		uri = window.location;
    }

    if (!uri.protocol || uri.protocol === ':') {
		protocol = window.location.protocol;
    } else {
		protocol = uri.protocol;
    }

    origin = protocol + '//' + uri.host;
    origin = origin.replace(/:80$|:443$/, '');

    return origin;
};

CrossStorageClient._generateUUID = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16|0, v = c == 'x' ? r : (r&0x3|0x8);

		return v.toString(16);
	});
};

CrossStorageClient.prototype = {

	onConnect: function() {
		var client = this;

		if (this._connected) {
			return this._promise.resolve();
		} else if (this._closed) {
			return this._promise.reject(new Error('CrossStorageClient has closed'));
		}

		if (!this._requests.connect) {
			this._requests.connect = [];
		}

		return new this._promise(function(resolve, reject) {
			var timeout = setTimeout(function() {
				reject(new Error('CrossStorageClient could not connect'));
			}, client._timeout);

			client._requests.connect.push(function(err) {
				clearTimeout(timeout);
				if (err) return reject(err);

				resolve();
			});
		});
	},

	set: function(key, value) {
		return this._request('set', {
			key:   key,
			value: value
		});
	},

	get: function(key) {
		var args = Array.prototype.slice.call(arguments);

		return this._request('get', {keys: args});
	},
	
	del: function() {
		var args = Array.prototype.slice.call(arguments);

		return this._request('del', {keys: args});
	},
	
	clear: function() {
		return this._request('clear');
	},
	
	getKeys: function() {
		return this._request('getKeys');
	},
	
	close: function() {
		var frame = document.getElementById(this._frameId);
		
		if (frame) {
			frame.parentNode.removeChild(frame);
		}

		// Support IE8 with detachEvent
		if (window.removeEventListener) {
			window.removeEventListener('message', this._listener, false);
		} else {
			window.detachEvent('onmessage', this._listener);
		}

		this._connected = false;
		this._closed = true;
	},
	
	_installListener: function() {
		var client = this;

		this._listener = function(message) {
			var i, origin, error, response;

			// Ignore invalid messages or those after the client has closed
			if (client._closed || !message.data || typeof message.data !== 'string') {
				return;
			}

			// postMessage returns the string "null" as the origin for "file://"
			origin = (message.origin === 'null') ? 'file://' : message.origin;

			// Ignore messages not from the correct origin
			if (origin !== client._origin) return;

			// LocalStorage isn't available in the hub
			if (message.data === 'cross-storage:unavailable') {
				if (!client._closed) client.close();
				if (!client._requests.connect) return;

				error = new Error('Closing client. Could not access localStorage in hub.');
				for (i = 0; i < client._requests.connect.length; i++) {
					client._requests.connect[i](error);
				}

				return;
			}

			// Handle initial connection
			if (message.data.indexOf('cross-storage:') !== -1 && !client._connected) {
				
				client._connected = true;
				
				if (!client._requests.connect) return;

				for (i = 0; i < client._requests.connect.length; i++) {
					client._requests.connect[i](error);
				}
				
				delete client._requests.connect;
				
			}

			if (message.data === 'cross-storage:ready') return;

			// All other messages
			try {
				response = JSON.parse(message.data);
			} catch(e) {
				return;
			}

			if (!response.id) return;

			if (client._requests[response.id]) {
				client._requests[response.id](response.error, response.result);
			}
		};

		// Support IE8 with attachEvent
		if (window.addEventListener) {
			window.addEventListener('message', this._listener, false);
		} else {
			window.attachEvent('onmessage', this._listener);
		}
	},

	poll: function() {
		var client, interval, targetOrigin;

		client = this;

		// postMessage requires that the target origin be set to "*" for "file://"
		targetOrigin = (client._origin === 'file://') ? '*' : client._origin;

		interval = setInterval(function() {
		  if (client._connected) return clearInterval(interval);
		  if (!client._hub) return;

		  client._hub.postMessage('cross-storage:poll', targetOrigin);
		}, 1000);
		
	},
	
	_createFrame: function(url) {
		var frame, key;

		frame = window.document.createElement('iframe');
		frame.id = this._frameId;

		// Style the iframe
		for (key in CrossStorageClient.frameStyle) {
			if (CrossStorageClient.frameStyle.hasOwnProperty(key)) {
				frame.style[key] = CrossStorageClient.frameStyle[key];
			}
		}

		window.document.body.appendChild(frame);
		frame.src = url;

		return frame;
	},

	_request: function(method, params) {
		var req, client;

		if (this._closed) {
			return this._promise.reject(new Error('CrossStorageClient has closed'));
		}

		client = this;
		client._count++;

		req = {
			id:     this._id + ':' + client._count,
			method: 'cross-storage:' + method,
			params: params
		};

		return new this._promise(function(resolve, reject) {
			var timeout, originalToJSON, targetOrigin;

			// Timeout if a response isn't received after 4s
			timeout = setTimeout(function() {
				if (!client._requests[req.id]) return;

				delete client._requests[req.id];
				reject(new Error('Timeout: could not perform ' + req.method));
			}, client._timeout);

			// Add request callback
			client._requests[req.id] = function(err, result) {
				clearTimeout(timeout);
				delete client._requests[req.id];
				if (err) return reject(new Error(err));
				resolve(result);
			};

			// In case we have a broken Array.prototype.toJSON, e.g. because of
			// old versions of prototype
			if (Array.prototype.toJSON) {
				originalToJSON = Array.prototype.toJSON;
				Array.prototype.toJSON = null;
			}

			// postMessage requires that the target origin be set to "*" for "file://"
			targetOrigin = (client._origin === 'file://') ? '*' : client._origin;

			// Send serialized message
			client._hub.postMessage(JSON.stringify(req), targetOrigin);

			// Restore original toJSON
			if (originalToJSON) {
				Array.prototype.toJSON = originalToJSON;
			}
		});
	}

};

/**
* Export for various environments.
*/
if (typeof module !== 'undefined' && module.exports) {
	module.exports = CrossStorageClient;
} else if (typeof exports !== 'undefined') {
	exports.CrossStorageClient = CrossStorageClient;
} else if (typeof define === 'function' && define.amd) {
	define([], function() {
		return CrossStorageClient;
	});
} else {
	this.CrossStorageClient = CrossStorageClient;
}