const supertest = require('supertest');
const pool = require('../../db');
const app = require('../../app');

const api = supertest(app);

describe('Citation points', () => {
  it('should return as JSON', async () => {
    await api
      .get(
        '/api/citation?longitude[]=-118.408773813724&longitude[]=34.01247583460179&latitude[]=-118.33788618627656&latitude[]=34.109414445309824'
      )
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
});

describe('Zip codes layer', () => {
  it('should return the correct number of zip codes', async () => {
    jest.setTimeout(5000);
    const response = await api
      .get('/api/zipcodes')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(response.body.features).toHaveLength(311);
  });
});

afterAll(async () => {
  await pool.end();
});
