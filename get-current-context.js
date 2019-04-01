"use strict";

let currentContext;

module.exports = () => currentContext;

Object.defineProperty(module.exports, "register", {
	configurable: true,
	writable: true,
	value: context => (currentContext = context)
});
