/**
 * http://dailyjs.com/2014/09/04/cross-storage/
 */
var CrossStorageHub = {};

CrossStorageHub.init = function(permissions) {
	var available = true;

	try {
		if (!window.localStorage) available = false;
	} catch (e) {
		available = false;
	}

	if (!available) {
		try {
			return window.parent.postMessage('cross-storage:unavailable', '*');
		} catch (e) {
			return;
		}
	}

	CrossStorageHub._permissions = permissions || [];
	CrossStorageHub._installListener();
	window.parent.postMessage('cross-storage:ready', '*');
};

CrossStorageHub._installListener = function() {
	var listener = CrossStorageHub._listener;
	if (window.addEventListener) {
		window.addEventListener('message', listener, false);
	} else {
		window.attachEvent('onmessage', listener);
	}
};

CrossStorageHub._listener = function(message) {
	var origin, targetOrigin, request, method, error, result, response;

	// postMessage returns the string "null" as the origin for "file://"
	//origin = (message.origin === 'null') ? 'file://' : message.origin;
	origin = (message.origin === 'null') ? 'file://' : message.source.location.href;

	// Handle polling for a ready message
	if (message.data === 'cross-storage:poll') {
		return window.parent.postMessage('cross-storage:ready', message.origin);
	}

	// Ignore the ready message when viewing the hub directly
	if (message.data === 'cross-storage:ready') return;

	// Check whether message.data is a valid json
	try {
		request = JSON.parse(message.data);
	} catch (err) {
		return;
	}

	// Check whether request.method is a string
	if (!request || typeof request.method !== 'string') {
		return;
	}

	method = request.method.split('cross-storage:')[1];

	if (!method) {
		return;
	} else if (!CrossStorageHub._permitted(origin, method)) {
		error = 'Invalid permissions for ' + method;
	} else {
		try {
			result = CrossStorageHub['_' + method](request.params);
		} catch (err) {
			error = err.message;
		}
	}

	response = JSON.stringify({
		id: request.id,
		error: error,
		result: result
	});

	// postMessage requires that the target origin be set to "*" for "file://"
	targetOrigin = (origin === 'file://') ? '*' : origin;

	window.parent.postMessage(response, targetOrigin);
};

CrossStorageHub._permitted = function(origin, method) {
	var available, i, entry, match;

	available = ['get', 'set', 'del', 'clear', 'getKeys'];
	if (!CrossStorageHub._inArray(method, available)) {
		return false;
	}

	for (i = 0; i < CrossStorageHub._permissions.length; i++) {
		entry = CrossStorageHub._permissions[i];
		if (!(entry.origin instanceof RegExp) || !(entry.allow instanceof Array)) {
			continue;
		}

		match = entry.origin.test(origin);
		if (match && CrossStorageHub._inArray(method, entry.allow)) {
			return true;
		}
	}

	return false;
};

CrossStorageHub._set = function(params) {
	window.localStorage.setItem(params.key, params.value);
};

CrossStorageHub._get = function(params) {
	var storage, result, i, value;

	storage = window.localStorage;
	result = [];

	for (i = 0; i < params.keys.length; i++) {
		try {
			value = storage.getItem(params.keys[i]);
		} catch (e) {
			value = null;
		}

		result.push(value);
	}

	return (result.length > 1) ? result : result[0];
};

CrossStorageHub._del = function(params) {
	for (var i = 0; i < params.keys.length; i++) {
		window.localStorage.removeItem(params.keys[i]);
	}
};

CrossStorageHub._clear = function() {
	window.localStorage.clear();
};

CrossStorageHub._getKeys = function(params) {
	var i, length, keys;

	keys = [];
	length = window.localStorage.length;

	for (i = 0; i < length; i++) {
		keys.push(window.localStorage.key(i));
	}

	return keys;
};

CrossStorageHub._inArray = function(value, array) {
	for (var i = 0; i < array.length; i++) {
		if (value === array[i]) return true;
	}

	return false;
};

CrossStorageHub._now = function() {
	if (typeof Date.now === 'function') {
		return Date.now();
	}

	return new Date().getTime();
};

/**
* Export for various environments.
*/
if (typeof module !== 'undefined' && module.exports) {
	module.exports = CrossStorageHub;
} else if (typeof exports !== 'undefined') {
	exports.CrossStorageHub = CrossStorageHub;
} else if (typeof define === 'function' && define.amd) {
	define([], function() {
		return CrossStorageHub;
	});
} else {
	this.CrossStorageHub = CrossStorageHub;
}