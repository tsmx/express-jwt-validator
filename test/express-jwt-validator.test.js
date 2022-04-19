const testApp = require('./test-app');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');

describe('express-jwt-validator test suite', () => {

    const testSecret = '123456';
    let testToken;

    beforeEach(() => {
        jest.resetModules();
        testToken = jwt.sign({ user: 'TestUser123', info: 'test test' }, testSecret);
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
});