const testApp = require('./test-app');
const supertest = require('supertest');

const { tokenSecret, generateTestTokens } = require('./test-utils');

describe('express-jwt-validator test suite for logging with log4js', () => {

    const testSecret = tokenSecret;
    const { testToken, expiredTestToken } = generateTestTokens();

    var testOutput = [], log4jsLogger;
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output) };

    beforeEach(() => {
        jest.resetModules();
        console.log = testConsoleLog;
        testOutput = [];
        const log4js = require('log4js');
        log4js.configure({
            appenders: { console: { type: 'console' } },
            categories: { default: { appenders: ['console'], level: 'info' } }
        });
        log4jsLogger = log4js.getLogger();
    });

    afterEach(() => {
        console.log = originalConsoleLog;
    });

    it('tests a failed access to a secret route without bearer token and a log4js logger defined', async () => {
        const app = testApp({ secret: testSecret, logger: log4jsLogger });
        const request = supertest(app);
        const response = await request
            .get('/secret');
        expect(response.status).toBe(401);
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].includes('[WARN]')).toBeTruthy();
    });

    it('tests a failed access to a secret route with an invalid auth header (\'Bearer \' prefix missing) and a log4js logger defined', async () => {
        const app = testApp({ secret: testSecret, logger: log4jsLogger });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', testToken);
        expect(response.status).toBe(401);
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].includes('[WARN]')).toBeTruthy();
    });

    it('tests a failed access to a secret route with an invalid bearer token and a log4js logger defined', async () => {
        const app = testApp({ secret: testSecret, logger: log4jsLogger });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer xyz');
        expect(response.status).toBe(401);
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].includes('[ERROR]')).toBeTruthy();
    });

    it('tests a failed access to a secret route with strict validation and an invalid bearer syntax and a log4js logger defined', async () => {
        const app = testApp({ secret: testSecret, logger: log4jsLogger, strictBearerValidation: true });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'BearerX ' + testToken);
        expect(response.status).toBe(401);
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].includes('[WARN]')).toBeTruthy();
    });

    it('tests a failed access to a secret route with an expired token and a log4js logger defined', async () => {
        const app = testApp({ secret: testSecret, logger: log4jsLogger });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + expiredTestToken);
        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].includes('[WARN]')).toBeTruthy();
    });

    it('tests a successful access to a secret route with a log4js logger defined', async () => {
        const app = testApp({ secret: testSecret, logger: log4jsLogger });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + testToken);
        expect(response.status).toBe(200);
        expect(response.body.authData.user).toBe('TestUser123');
        expect(response.body.authData.info).toBe('test test');
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].includes('[INFO]')).toBeTruthy();
    });

});