const testApp = require('./test-app');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');

describe('express-jwt-validator test suite', () => {

    const testSecret = '123456';
    let testToken, expiredTestToken;

    beforeEach(() => {
        jest.resetModules();
        testToken = jwt.sign({ user: 'TestUser123', info: 'test test' }, testSecret);
        expiredTestToken = jwt.sign({ user: 'TestUser123', info: 'test test' }, testSecret, { expiresIn: 0 });
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
    });
});