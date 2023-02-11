const request = require('supertest');
const app = require("../../index");

describe('GET /', () => {
    it('should return "Hello Typescript with Node.js!"', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe('Hello Typescript with Node.js!');
    });
});
