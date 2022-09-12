const request = require("supertest");
const app = require("../../app");
const {mongoConnect, mongoDisconnect} = require('../../services/mongo');
const {loadPlanetsData} = require('../../model/planets.model');

describe('Testing launches API', () =>{
    
    beforeAll(async() =>{
        await mongoConnect();
        await loadPlanetsData();
    });

    afterAll(async() => {
        await mongoDisconnect();
    })

    describe("Test GET /v1/launches", () => {
        test('It should response with 200 success', async() => {
            const response = await request(app).get('/v1/launches').expect(200);
        });
    });
    
    describe("Test /post launch", ()=> {
        const completeLaunchData = {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: "Kepler-62 f",
            launchDate: "January 4,2028"
        };
    
        const completeLaunchDataWithoutDate = {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: "Kepler-62 f",
        };
    
        const launcDataWithInvalidDate = {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: "Kepler-62 f",
            launchDate: "zoot"
        };
        test('It should response with 200 success', async() =>{
            const response = await (await request(app).post('/v1/launches').send(completeLaunchData).expect('Content-Type', /json/).expect(201));
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
    
            expect(response.body).toMatchObject(completeLaunchDataWithoutDate)
        });
    
        test("It should test missing required properties", async() => {
            const response = await request(app).post('/v1/launches').send(completeLaunchDataWithoutDate).expect('Content-Type', /json/).expect(400);
    
            expect(response.body).toStrictEqual({
                error: "Missing required launch property"
            });
        });
        test("It should catch invalid dates", async() => {
            const response = await request(app).post('/v1/launches').send(launcDataWithInvalidDate).expect('Content-Type', /json/).expect(400);
    
            expect(response.body).toStrictEqual({
                error: "Invalid launch date"
            });
        });
    });
});

