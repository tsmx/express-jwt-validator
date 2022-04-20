const testApp = require('./test-app');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const MemoryStream = require('memorystream');

describe('express-jwt-validator test suite', () => {

    const testSecret = '123456';
    let testToken, expiredTestToken, winstonLogger, memStream;


    let format = winston.format;
    const myFormat = format.printf((info) => {
        return `${info.level.toUpperCase()} ${info.message}`;
    });


    beforeEach(() => {
        jest.resetModules();
        testToken = jwt.sign({ user: 'TestUser123', info: 'test test' }, testSecret);
        expiredTestToken = jwt.sign({ user: 'TestUser123', info: 'test test' }, testSecret, { expiresIn: 0 });
        memStream = new MemoryStream(null, { readable: false, end: false })
        winstonLogger = winston.createLogger({
            format: myFormat,
            transports: [new winston.transports.Stream({ stream: memStream })]
        });
    });

    it('tests a failed middleware construction because of a missing JWT secret', async () => {
        expect(() => { testApp(); }).toThrow('No secret value provided!');
    });

    it('tests a successful access to a public route without bearer token', async () => {
        const app = testApp({ secret: testSecret });
        const request = supertest(app);
        const response = await request
            .get('/public');
        expect(response.status).toBe(200);
        expect(response.body.path).toBe('public');
        expect(memStream.toString()).toBe('');
    });

    it('tests a failed access to a secret route without bearer token', async () => {
        const app = testApp({ secret: testSecret });
        const request = supertest(app);
        const response = await request
            .get('/secret');
        expect(response.status).toBe(401);
        expect(memStream.toString()).toBe('');
    });

    it('tests a failed access to a secret route with an invalid auth header (\'Bearer \' prefix missing)', async () => {
        const app = testApp({ secret: testSecret });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', testToken);
        expect(response.status).toBe(401);
        expect(memStream.toString()).toBe('');
    });

    it('tests a failed access to a secret route with an invalid bearer token', async () => {
        const app = testApp({ secret: testSecret });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer xyz');
        expect(response.status).toBe(401);
        expect(memStream.toString()).toBe('');
    });

    it('tests a successful access to a secret route', async () => {
        const app = testApp({ secret: testSecret });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + testToken);
        expect(response.status).toBe(200);
        expect(response.body.authData.user).toBe('TestUser123');
        expect(response.body.authData.info).toBe('test test');
        expect(memStream.toString()).toBe('');
    });

    it('tests a successful access to a secret route with a custom request property', async () => {
        const app = testApp({ secret: testSecret, requestAuthProp: 'tokenPayload' });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + testToken);
        expect(response.status).toBe(200);
        expect(response.body.tokenPayload.user).toBe('TestUser123');
        expect(response.body.tokenPayload.info).toBe('test test');
        expect(memStream.toString()).toBe('');
    });

    it('tests a failed access to a secret route with an expired token', async () => {
        const app = testApp({ secret: testSecret });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + expiredTestToken);
        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
        expect(memStream.toString()).toBe('');
    });

    it('tests a failed access to a secret route with an expired token and no error message', async () => {
        const app = testApp({ secret: testSecret, sendExpiredMessage: false });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + expiredTestToken);
        expect(response.status).toBe(401);
        expect(response.body.error).toBeUndefined();
        expect(memStream.toString()).toBe('');
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

    it('tests a failed access to a secret route without bearer token and an alternative HTTP status code', async () => {
        const app = testApp({ secret: testSecret, failedStatus: 403 });
        const request = supertest(app);
        const response = await request
            .get('/secret');
        expect(response.status).toBe(403);
        expect(memStream.toString()).toBe('');
    });

    it('tests a failed access to a secret route with an invalid auth header (\'Bearer \' prefix missing) and an alternative HTTP status code', async () => {
        const app = testApp({ secret: testSecret, failedStatus: 403 });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', testToken);
        expect(response.status).toBe(403);
        expect(memStream.toString()).toBe('');
    });

    it('tests a failed access to a secret route with an invalid bearer token and an alternative HTTP status code', async () => {
        const app = testApp({ secret: testSecret, failedStatus: 403 });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer xyz');
        expect(response.status).toBe(403);
        expect(memStream.toString()).toBe('');
    });

    it('tests a failed access to a secret route with an expired token and an alternative HTTP status code', async () => {
        const app = testApp({ secret: testSecret, failedStatus: 403 });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + expiredTestToken);
        expect(response.status).toBe(403);
        expect(response.body.error).toBeDefined();
        expect(memStream.toString()).toBe('');
    });
});