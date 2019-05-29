[![*nix build status][nix-build-image]][nix-build-url]
[![Windows build status][win-build-image]][win-build-url]
[![Tests coverage][cov-image]][cov-url]

# aws-lambda-handler

## Essential AWS Lambda handler setup

When relying directly on basic AWS interface we're immune to handler setup errors which are not transparently reported by AWS:

-   Using _callback_ resolution we invoke call callback twice (and we're not restricted from invoking _callback_ coming from previous invocation). All those superfluous invocations are silently ignored by AWS.
-   Using _promise_ resolution, invocation is resolved immediately after returned promise resolves. This leaves us with no feedback of eventually orphaned async flows (which may be result of typical errors as omitted `await` or `return`) and which are eventually executed in next lambda invocation

This **handler makes above errors either impossible to make or properly exposed**, and additionally:

-   **Enforces simple input/output function setup** (no matter whether sync or promise returning)
-   **Rejects any resolution attemps via `context.done`** or it's affiliates
-   **Prevents direct setting of `context.callbackWaitsForEmptyEventLoop`**, as having it `false` may leak scheduled tasks between lambda invocations.
-   Exposes `get-current-context` module, which **provides out of band access to current invocation `context`**.

### Usage

#### Handler configuration

```javascript
module.exports = require("aws-lambda-handler")((event, context) => {
    // ...lambda logic
    return result;
});
```

Above module exports lambda logic on `handler` property

#### Out of band `context` access

_some-outer-module-down-the-path.js_

```javascript
const getCurrentContext = require("aws-lambda-handler/get-current-context");

module.exports = (...) => {
  // Retrieve invocation context
  const invocationContext = getCurrentContext();
  if (invocationContext.getRemainingTimeInMillis() > 1000 * 60) {
    // We have time
  } else {
    throw new Error("Not enough time");
  }
}
```

### Tests

```bash
npm test
```

[nix-build-image]: https://semaphoreci.com/api/v1/medikoo-org/aws-lambda-handler/branches/master/shields_badge.svg
[nix-build-url]: https://semaphoreci.com/medikoo-org/aws-lambda-handler
[win-build-image]: https://ci.appveyor.com/api/projects/status/pf6tqdw7peshona2?svg=true
[win-build-url]: https://ci.appveyor.com/api/project/medikoo/aws-lambda-handler
[cov-image]: https://img.shields.io/codecov/c/github/medikoo/aws-lambda-handler.svg
[cov-url]: https://codecov.io/gh/medikoo/aws-lambda-handler
[transpilation-image]: https://img.shields.io/badge/transpilation-free-brightgreen.svg
