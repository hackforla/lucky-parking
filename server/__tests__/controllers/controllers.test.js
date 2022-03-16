const supertest = require('supertest');
const pool = require('../../db');
const app = require('../../app');

const api = supertest(app);

describe('GET requests', () => {
  it('should get citation points', async () => {
    await api
      .get(
        '/api/citation?longitude[]=-118.408773813724&longitude[]=34.01247583460179&latitude[]=-118.33788618627656&latitude[]=34.109414445309824'
      )
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('should get the zip layer', async () => {
    jest.setTimeout(1000);
    await api
      .get('/api/zipcodes')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
});

afterAll(async () => {
  await pool.end();
});
