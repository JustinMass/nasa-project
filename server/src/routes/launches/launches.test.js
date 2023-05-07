const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

const version = '/v1';

describe('Launches API', () => {
  //setup
  beforeAll(async () => {
    await mongoConnect();
  });
  //teardown
  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET / launches', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .get(`${version}/launches`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('Test POST /launch', () => {
    const completeLaunchData = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-442 b',
      launchDate: 'January 4, 2028',
    };

    const completeLaunchDataWithoutDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-442 b',
    };

    const completeLaunchDataWithInvalidDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-442 b',
      launchDate: 'zoot',
    };

    test('It should respond with 201 success', async () => {
      const response = await request(app)
        .post(`${version}/launches`)
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(completeLaunchDataWithoutDate);
    });

    test('It should catch missing required properites', async () => {
      const response = await request(app)
        .post(`${version}/launches`)
        .send(completeLaunchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post(`${version}/launches`)
        .send(completeLaunchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });
});
