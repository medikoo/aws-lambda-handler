"use strict";

require("essentials");

const ensurePlainFunction           = require("es5-ext/object/ensure-plain-function")
    , isThenable                    = require("es5-ext/object/is-thenable")
    , LambdaConfigurationError      = require("./lib/lambda-configuration-error")
    , { register: registerContext } = require("./get-current-context");

const rejectContextDone = () => {
	throw new LambdaConfigurationError("Unexpected resolution via context.done");
};

module.exports = handler => {
	ensurePlainFunction(handler);
	return {
		handler: (event, context, callback) => {
			if (context.done) context.done = rejectContextDone;
			Object.defineProperty(context, "callbackWaitsForEmptyEventLoop", { writable: false });
			registerContext(context);
			let handlerResult;
			try {
				handlerResult = handler(event, context);
			} catch (error) {
				if (error.name === "LambdaConfigurationError") throw error;
				callback(error);
				return;
			}
			if (!isThenable(handlerResult)) {
				callback(null, handlerResult);
				return;
			}
			Promise.resolve(handlerResult).then(result => callback(null, result), callback);
		}
	};
};
