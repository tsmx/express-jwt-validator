const testApp = require('./test-app');
const supertest = require('supertest');
const winston = require('winston');
const MemoryStream = require('memorystream');

const { tokenSecret, generateTestTokens } = require('./test-utils');

describe('express-jwt-validator test suite for logging with winston', () => {

    const testSecret = tokenSecret;
    const { testToken, expiredTestToken } = generateTestTokens();
    let winstonLogger, memStream;

    let format = winston.format;
    const myFormat = format.printf((info) => {
        return `${info.level.toUpperCase()} ${info.message}`;
    });

    beforeEach(() => {
        jest.resetModules();
        memStream = new MemoryStream(null, { readable: false, end: false })
        winstonLogger = winston.createLogger({
            format: myFormat,
            transports: [new winston.transports.Stream({ stream: memStream })]
        });
    });

    it('tests a failed access to a secret route without bearer token and a winston logger defined', async () => {
        const app = testApp({ secret: testSecret, logger: winstonLogger });
        const request = supertest(app);
        const response = await request
            .get('/secret');
        expect(response.status).toBe(401);
        expect(memStream.toString()).toMatch(/^WARN?/);
    });

    it('tests a failed access to a secret route with an invalid auth header (\'Bearer \' prefix missing) and a winston logger defined', async () => {
        const app = testApp({ secret: testSecret, logger: winstonLogger });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', testToken);
        expect(response.status).toBe(401);
        expect(memStream.toString()).toMatch(/^WARN?/);
    });

    it('tests a failed access to a secret route with an invalid bearer token and a winston logger defined', async () => {
        const app = testApp({ secret: testSecret, logger: winstonLogger });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer xyz');
        expect(response.status).toBe(401);
        expect(memStream.toString()).toMatch(/^ERROR?/);
    });

    it('tests a failed access to a secret route with an expired token and a winston logger defined', async () => {
        const app = testApp({ secret: testSecret, logger: winstonLogger });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + expiredTestToken);
        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
        expect(memStream.toString()).toMatch(/^WARN?/);
    });

    it('tests a successful access to a secret route with a winston logger defined', async () => {
        const app = testApp({ secret: testSecret, logger: winstonLogger });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + testToken);
        expect(response.status).toBe(200);
        expect(response.body.authData.user).toBe('TestUser123');
        expect(response.body.authData.info).toBe('test test');
        expect(memStream.toString()).toMatch(/^INFO?/);
    });

});