const express = require('express');
const { verifyToken } = require('../express-jwt-validator');

module.exports = (conf) => {
    const app = express();
    app.get('/public', (req, res) => {
        res.json({ path: 'public' });
    });
    app.get('/secret', verifyToken(conf), (req, res) => {
        res.json({ path: 'secret' });
    });
    return app;
}