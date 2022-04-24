const jwt = require('jsonwebtoken');

const tokenSecret = '123456';

module.exports.tokenSecret = tokenSecret;

module.exports.generateTestTokens = () => {
    let testToken = jwt.sign({ user: 'TestUser123', info: 'test test' }, tokenSecret);
    let expiredTestToken = jwt.sign({ user: 'TestUser123', info: 'test test' }, tokenSecret, { expiresIn: 0 });
    return { testToken, expiredTestToken };
}