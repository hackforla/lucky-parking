const request = require('supertest')('http://localhost:5000');
const nock = require('nock');
// const app = require('../../app');
// const { Pool } = require('pg');

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    release: jest.fn(),
  };

  return {
    Pool: jest.fn(() => mPool),
  };
});

const lon = [-118.408773813724, 34.01247583460179];
const lat = [-118.33788618627656, 34.109414445309824];

describe('Mock requests', () => {
  // let pool;
  const mockRes = {
    status: 200,
    message: 'This is a mocked response',
  };
  const url = 'http://localhost:5000';

  beforeEach(() => {
    // pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns a succesful mock response', async () => {
      nock(url)
        .get(
          `/api/citation?longitude[]=${lon[0]}&longitude[]=${lon[1]}&latitude[]=${lat[0]}&latitude[]=${lat[1]}`
        )
        .reply(200, mockRes);

      const res = await request.get(
        `/api/citation?longitude[]=${lon[0]}&longitude[]=${lon[1]}&latitude[]=${lat[0]}&latitude[]=${lat[1]}`
      );

      expect(res.body.status).toStrictEqual(200);
      expect(res.body.message).toStrictEqual('This is a mocked response');
      // expect(pool.connect).toBeCalledTimes(1);
    });
  });

  describe('getZipLayer', () => {
    it('returns a succesful mock response', async () => {
      nock(url).get(`/api/zipcodes`).reply(200, mockRes);

      const res = await request.get(`/api/zipcodes`);

      expect(res.body.status).toStrictEqual(200);
      expect(res.body.message).toStrictEqual('This is a mocked response');
    });
  });
});

// describe('Zip codes layer', () => {
//   it('should return the correct number of zip codes', async () => {
//     const response = await api
//       .get(`/api/zipcodes`)
//       .expect(200)
//       .expect('Content-Type', /application\/json/);
//     expect(response.body.features).toHaveLength(311);
//   });
// });

// describe('Individual citation point', () => {
//   it('should return as JSON', async () => {
//     const index = 384330;
//     await api
//       .get(`/api/citation/point?index=${index}`)
//       .expect(200)
//       .expect('Content-Type', /application\/json/);
//   });

//   it('should return the correct citation point information', async () => {
//     const index = 384330;
//     const response = await api.get(`/api/citation/point?index=${index}`);

//     expect(response.body[0].index).toEqual('384330');
//     expect(response.body[0].make).toEqual('Volkswagen');
//     expect(response.body[0].location).toEqual('714 WALL ST S');
//   });
// });

// afterAll(async () => {
//   await pool.end();
// });
