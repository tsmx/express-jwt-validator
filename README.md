# [**@tsmx/express-jwt-validator**](https://github.com/tsmx/express-jwt-validator)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![npm (scoped)](https://img.shields.io/npm/v/@tsmx/express-jwt-validator)
![node-current (scoped)](https://img.shields.io/node/v/@tsmx/express-jwt-validator)
[![Build Status](https://img.shields.io/github/workflow/status/tsmx/express-jwt-validator/git-ci-build)](https://img.shields.io/github/workflow/status/tsmx/express-jwt-validator/git-ci-build)
[![Coverage Status](https://coveralls.io/repos/github/tsmx/express-jwt-validator/badge.svg?branch=master)](https://coveralls.io/github/tsmx/express-jwt-validator?branch=master)

> Simple express middleware for validating JWT bearer tokens. 

Stop writing boilerplate to protect [express](https://www.npmjs.com/package/express) routes with [JWT](https://www.npmjs.com/package/jsonwebtoken) bearer tokens in your projects.

Supports optional log output using [winston](https://www.npmjs.com/package/winston) or any compatible logger.

## Usage

```js
const express = require('express');
const app = express();

const verifyToken = require('@tsmx/express-jwt-validator')({ secret: 'YOUR_JWT_SECRET' });

app.get('/secret', verifyToken, (req, res) => {
  res.status(200).send('This route can only be accessed with a valid JWT bearer token.');
});
```

## How it works

This module exports a middleware function for express to check a request for a valid JSON Web token authorization. The token must be provided as a bearer token in the HTTP request header according to the [RFC standard](https://datatracker.ietf.org/doc/html/rfc6750#section-2.1).

Requests with a failed JWT validation will be rejected with [HTTP status 401](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) by default. If the validations succeeds, the verified JWT payload will be added to the rquest and it will be passed to the next element of the middleware chain.

![verify-token-schema](https://tsmx.net/wp-content/uploads/2022/04/verify-token-schema.png)

## Configuration options

When requiring in the middleware with...

```js
const verifyToken = require('@tsmx/express-jwt-validator')({ /* configuration object */ });
```

...the passed configuration object supports the following porperties.

### secret

Type: `String`
Default: `undefined`
Mandatory: yes

### header

Type: `String`
Default: `authorization`
Mandatory: no

### rejectHttpStatus

Type: `Number`
Default: `401`
Mandatory: no

### sendExpiredMessage

Type: `Boolean`
Default: `true`
Mandatory: no

### requestAuthProp

Type: `String`
Default: `authData`
Mandatory: no

### logger

Type: `Object`
Default: `undefined`
Mandatory: no

Coming soon...