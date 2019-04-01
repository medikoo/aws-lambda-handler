"use strict";

module.exports = class LambdaConfigurationError extends Error {
	constructor(...args) {
		super(...args);
		this.name = this.constructor.name;
	}
};
