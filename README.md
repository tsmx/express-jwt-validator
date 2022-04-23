# [**@tsmx/express-jwt-validator**](https://github.com/tsmx/express-jwt-validator)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![npm (scoped)](https://img.shields.io/npm/v/@tsmx/express-jwt-validator)
![node-current (scoped)](https://img.shields.io/node/v/@tsmx/express-jwt-validator)
[![Build Status](https://img.shields.io/github/workflow/status/tsmx/express-jwt-validator/git-ci-build)](https://img.shields.io/github/workflow/status/tsmx/express-jwt-validator/git-ci-build)
[![Coverage Status](https://coveralls.io/repos/github/tsmx/express-jwt-validator/badge.svg?branch=master)](https://coveralls.io/github/tsmx/express-jwt-validator?branch=master)

> Simple express middleware for validating JWT bearer tokens. 

Stop writing boilerplate to protect [express](https://www.npmjs.com/package/express) routes with [JWT](https://www.npmjs.com/package/jsonwebtoken) bearer tokens in your projects.

## Usage

```js
const express = require('express');
const app = express();

const { verifyToken } = require('@tsmx/express-jwt-validator')({ secret: 'YOUR_JWT_SECRET' });

app.get('/secret', verifyToken, (req, res) => {
  res.status(200).send('This route can only be accessed with a valid JWT bearer token.');
});
```

## How it works

## Configuarion options