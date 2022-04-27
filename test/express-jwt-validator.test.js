const testApp = require('./test-app');
const supertest = require('supertest');

const { tokenSecret, generateTestTokens } = require('./test-utils');

describe('express-jwt-validator test suite', () => {

    const testSecret = tokenSecret;
    const { testToken, expiredTestToken } = generateTestTokens();

    beforeEach(() => {
        jest.resetModules();
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
    });

    it('tests a failed access to a secret route without bearer token', async () => {
        const app = testApp({ secret: testSecret });
        const request = supertest(app);
        const response = await request
            .get('/secret');
        expect(response.status).toBe(401);
    });

    it('tests a failed access to a secret route with an invalid auth header (\'Bearer \' prefix missing)', async () => {
        const app = testApp({ secret: testSecret });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', testToken);
        expect(response.status).toBe(401); 
    });

    it('tests a failed access to a secret route with an invalid bearer token', async () => {
        const app = testApp({ secret: testSecret });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer xyz');
        expect(response.status).toBe(401);
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
    });

    it('tests a successful access to a secret route with strict validation', async () => {
        const app = testApp({ secret: testSecret, strictBearerValiadtion: true });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + testToken);
        expect(response.status).toBe(200);
        expect(response.body.authData.user).toBe('TestUser123');
        expect(response.body.authData.info).toBe('test test');
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
    });

    it('tests a successful access to a secret route with a custom header property', async () => {
        const app = testApp({ secret: testSecret, header: 'auth' });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('auth', 'Bearer ' + testToken);
        expect(response.status).toBe(200);
        expect(response.body.authData.user).toBe('TestUser123');
        expect(response.body.authData.info).toBe('test test');
    });

    it('tests a failed access to a secret route with an expired token', async () => {
        const app = testApp({ secret: testSecret });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + expiredTestToken);
        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
    });

    it('tests a failed access to a secret route with an strict validation (\'Bearer\' prefix wrong)', async () => {
        const app = testApp({ secret: testSecret, strictBearerValidation: true });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'BearerX ' + testToken);
        expect(response.status).toBe(401);
        expect(response.body.error).toBeUndefined();
    });

    it('tests a failed access to a secret route with an strict validation (too much header elements)', async () => {
        const app = testApp({ secret: testSecret, strictBearerValidation: true });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + testToken * ' xxxxxx');
        expect(response.status).toBe(401);
        expect(response.body.error).toBeUndefined();
    });

    it('tests a failed access to a secret route with an expired token and no error message', async () => {
        const app = testApp({ secret: testSecret, sendExpiredMessage: false });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + expiredTestToken);
        expect(response.status).toBe(401);
        expect(response.body.error).toBeUndefined();
    });

    it('tests a failed access to a secret route without bearer token and an alternative HTTP status code', async () => {
        const app = testApp({ secret: testSecret, rejectHttpStatus: 403 });
        const request = supertest(app);
        const response = await request
            .get('/secret');
        expect(response.status).toBe(403);
    });

    it('tests a failed access to a secret route with an invalid auth header (\'Bearer \' prefix missing) and an alternative HTTP status code', async () => {
        const app = testApp({ secret: testSecret, rejectHttpStatus: 403 });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', testToken);
        expect(response.status).toBe(403);
    });

    it('tests a failed access to a secret route with an invalid bearer token and an alternative HTTP status code', async () => {
        const app = testApp({ secret: testSecret, rejectHttpStatus: 403 });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer xyz');
        expect(response.status).toBe(403);
    });

    it('tests a failed access to a secret route with an expired token and an alternative HTTP status code', async () => {
        const app = testApp({ secret: testSecret, rejectHttpStatus: 403 });
        const request = supertest(app);
        const response = await request
            .get('/secret')
            .set('Authorization', 'Bearer ' + expiredTestToken);
        expect(response.status).toBe(403);
        expect(response.body.error).toBeDefined();
        expect(response.body.error).toStrictEqual('TokenExpiredError');
    });
});