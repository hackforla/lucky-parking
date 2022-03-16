const supertest = require('supertest');
const pool = require('../../db');
const app = require('../../app');

const api = supertest(app);

jest.setTimeout(10000);

const lon = [-118.408773813724, 34.01247583460179];
const lat = [-118.33788618627656, 34.109414445309824];

describe('Citation points', () => {
  it('should return as JSON', async () => {
    await api
      .get(
        `/api/citation?longitude[]=${lon[0]}&longitude[]=${lon[1]}&latitude[]=${lat[0]}&latitude[]=${lat[1]}`
      )
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
});

describe('Zip codes layer', () => {
  it('should return the correct number of zip codes', async () => {
    const response = await api
      .get(`/api/zipcodes`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(response.body.features).toHaveLength(311);
  });
});

describe('Individual citation point', () => {
  it('should return as JSON', async () => {
    const index = 384330;
    await api
      .get(`/api/citation/point?index=${index}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('should return the correct citation point information', async () => {
    const index = 384330;
    const response = await api.get(`/api/citation/point?index=${index}`);

    expect(response.body[0].index).toEqual('384330');
    expect(response.body[0].make).toEqual('Volkswagen');
    expect(response.body[0].location).toEqual('714 WALL ST S');
  });
});

afterAll(async () => {
  await pool.end();
});
