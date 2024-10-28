const request = require("supertest");
const app = require("../../../src/app");

describe("Landlord API", () => {
    it("should return a 200 status code", async () => {
        const response = await request(app).get("/api/landlord/inventory");
        expect(response.statusCode).toBe(200);
    });
});