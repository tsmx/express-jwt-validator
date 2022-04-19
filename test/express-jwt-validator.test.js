const testApp = require('./test-app');
const supertest = require('supertest');

describe('express-jwt-validator test suite', () => {

    beforeEach(() => {
        jest.resetModules();
    });

    it('tests a failed middleware construction because of a missing JWT secret', async () => {
        expect(() => { testApp(); }).toThrow('No secret value provided!');
    });

    it('tests successful access to a public route without bearer token', async () => {
        const app = testApp({ secret: '123456' });
        const request = supertest(app);
        const response = await request
            .get('/public');
        expect(response.status).toBe(200);
    });

    it('tests failed access to a public route withpot bearer token', async () => {
        const app = testApp({ secret: '123456' });
        const request = supertest(app);
        const response = await request
            .get('/secret');
        expect(response.status).toBe(401);
    });
});