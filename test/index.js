"use strict";

const { assert }        = require("chai")
    , createHandler     = require("../")
    , getCurrentContext = require("../get-current-context");

describe("(main)", () => {
	it("Should expose handler on 'handler' property", () =>
		assert(typeof createHandler(() => true).handler === "function")
	);
	it("Should pass through `event` to passed handler", () => {
		const event = {};
		createHandler(inputEvent => assert(inputEvent === event)).handler(event, {}, () => null);
	});
	it("Should pass through `context` to passed handler", () => {
		const context = {};
		createHandler((event, inputContext) => assert(inputContext === context)).handler(
			{}, context, () => null
		);
	});
	it("Should not pass `callback`", () =>
		createHandler((event, inputContext, noCallback) =>
			assert(noCallback === undefined)
		).handler({}, {}, () => null)
	);
	it("Should resolve synchronously with returned non-thenable result", () =>
		createHandler(() => 44).handler({}, {}, (error, result) => {
			assert(error === null);
			assert(result === 44);
		})
	);
	it("Should reject synchronously if crashed", () => {
		const error = new Error();
		createHandler(() => { throw error; }).handler({}, {}, (thrownError, result) => {
			assert(thrownError === error);
			assert(result === undefined);
		});
	});
	it(
		"Should resolve asynchronously with returned thenable",
		() =>
			new Promise(resolve => {
				createHandler(() => Promise.resolve(44)).handler({}, {}, (error, result) => {
					assert(error === null);
					assert(result === 44);
					resolve();
				});
			})
	);
	it(
		"Should reject asynchronously with returned rejected thenable",
		() =>
			new Promise(resolve => {
				const error = new Error();
				createHandler(() => Promise.reject(error)).handler(
					{},
					{},
					(thrownError, result) => {
						assert(thrownError === error);
						assert(result === undefined);
						resolve();
					}
				);
			})
	);
	it("Should reject context.done resolution attempts", () => {
		try {
			createHandler((event, context) => context.done()).handler(
				{}, { done: () => null }, () => null
			);
			throw new Error("Unexpected");
		} catch (error) {
			assert(error.name);
		}
	});
	it("Should provide out of band access to current context", () => {
		const context = {};
		createHandler(() => assert(getCurrentContext() === context)).handler(
			{}, context, () => null
		);
	});
});
