const request = require("supertest");
const app = require("../../../src/app");

describe("Tenant API", () => {
    it("should return a 200 status code", async () => {
        const response = await request(app).get("/api/tenant/billing");
        expect(response.statusCode).toBe(200);
    });
});