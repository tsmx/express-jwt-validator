/* istanbul ignore file */

const express = require('express');
const { verifyToken } = require('../express-jwt-validator');

module.exports = (conf) => {
    const app = express();
    const authProp = (conf && conf.requestAuthProp) ? conf.requestAuthProp : 'authData'
    app.get('/public', (req, res) => {
        res.json({ path: 'public' });
    });
    app.get('/secret', verifyToken(conf), (req, res) => {
        let result = { path: 'secret' };
        result[authProp] = req[authProp];
        res.json(result);
    });
    return app;
}