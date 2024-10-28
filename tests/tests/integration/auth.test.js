const request = require("supertest");
const app = require("../../../src/app");

describe("Auth API", () => {
    it("should return a 200 status code", async () => {
        const response = await request(app).get("/api/auth/login");
        expect(response.statusCode).toBe(200);
    });
}); 