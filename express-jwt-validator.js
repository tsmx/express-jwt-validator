const jwt = require('jsonwebtoken');

const bearerPrefix = 'Bearer';

const defaultHeader = 'authorization';
const defaultFailedStatus = 401;
const defaultSendExpiredMessage = true;
const defaultRequestAuthProp = 'authData';
const defaultStrictBearerValidation = false;

module.exports = (conf) => {
    // check if conf and conf.secret are present (minimal requirement)
    if (!conf || !conf.secret) {
        throw new Error('No secret value provided!');
    }
    // check for optional conf values or use default values instead
    const authHeader = conf.header ? conf.header : defaultHeader;
    const rejectHttpStatus = conf.rejectHttpStatus ? conf.rejectHttpStatus : defaultFailedStatus;
    const sendExpiredMessage = Object.prototype.hasOwnProperty.call(conf, 'sendExpiredMessage') ? conf.sendExpiredMessage === true : defaultSendExpiredMessage;
    const requestAuthProp = conf.requestAuthProp ? conf.requestAuthProp : defaultRequestAuthProp;
    const strictBearerValidation = Object.prototype.hasOwnProperty.call(conf, 'strictBearerValidation') ? conf.strictBearerValidation === true : defaultStrictBearerValidation;
    // return middleware function
    return (req, res, next) => {
        const authorizationHeader = req.headers[authHeader];
        if (typeof authorizationHeader !== 'undefined') {
            const bearer = authorizationHeader.split(' ');
            if (bearer.length < 2) {
                if (conf.logger) conf.logger.warn('Bearer token was not sent. Denying request.');
                res.sendStatus(rejectHttpStatus);
                return;
            }
            if (strictBearerValidation) {
                if (bearer.length !== 2 || bearer[0] !== bearerPrefix) {
                    if (conf.logger) conf.logger.warn('Strict Bearer validation failed. Denying request.');
                    res.sendStatus(rejectHttpStatus);
                    return;
                }
            }
            const bearerToken = bearer[1];
            jwt.verify(bearerToken, conf.secret, (err, authData) => {
                if (err) {
                    if (err.name == 'TokenExpiredError') {
                        if (conf.logger) conf.logger.warn('Expired bearer token was sent. Denying request.');
                        if (sendExpiredMessage) {
                            // Deny TokenExpiredError with additional message payload for the ability of client re-login
                            res.status(rejectHttpStatus).json({ error: err.name });
                            return;
                        }
                        else {
                            // Deny expired token without additional message
                            res.sendStatus(rejectHttpStatus);
                            return;
                        }
                    }
                    else {
                        if (conf.logger) conf.logger.error('Invalid bearer token was sent. Denying request.');
                        res.sendStatus(rejectHttpStatus);
                        return;
                    }
                } else {
                    req[requestAuthProp] = authData;
                    if (conf.logger) conf.logger.info('Token verification successful');
                    next();
                }
            });
        } else {
            if (conf.logger) conf.logger.warn('Authorization header was not sent. Denying request.');
            res.sendStatus(rejectHttpStatus);
            return;
        }
    }
};