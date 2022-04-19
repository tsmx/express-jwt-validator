module.exports.verifyToken = function (req, res, next) {
    const authorizationHeader = req.headers['authorization'];
    if (typeof authorizationHeader !== 'undefined') {
        const bearer = authorizationHeader.split(' ');
        if (bearer.length < 2) {
            logger.warn('Bearer token was not sent. Denying request.');
            res.sendStatus(401);
        }
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, conf.tokensecret, (err, authData) => {
            if (err) {
                if (err.name == 'TokenExpiredError') {
                    // TokenExpiredError should explicitly be sent to the client to 
                    // have the ability of re-login!
                    logger.warn('Expired bearer token was sent. Denying request.');
                    res.status(401).json({ error: err.name });
                }
                else {
                    logger.error('Invalid bearer token was sent. Denying request.');
                    res.sendStatus(401);
                }
            } else {
                req.authData = authData;
                logger.info('Successful token verification for user: ' + authData.email + ' (client: ' + authData.client + ')');
                next();
            }
        });
    } else {
        logger.warn('AuthorizationHeader was not sent. Denying request.');
        res.sendStatus(401);
    }
};