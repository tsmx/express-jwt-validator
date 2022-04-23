/* istanbul ignore file */

const express = require('express');

module.exports = (conf) => {
    const verifyToken = require('../express-jwt-validator')(conf);
    const app = express();
    const authProp = (conf && conf.requestAuthProp) ? conf.requestAuthProp : 'authData'
    app.get('/public', (req, res) => {
        res.json({ path: 'public' });
    });
    app.get('/secret', verifyToken, (req, res) => {
        let result = { path: 'secret' };
        result[authProp] = req[authProp];
        res.json(result);
    });
    return app;
}