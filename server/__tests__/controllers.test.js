const { Pool } = require('pg');
const controller = require('../controllers/controllers');
const { mockRequest, mockResponse } = require('../utils/interceptor');

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn().mockReturnValue({ release: jest.fn() }),
    query: jest.fn(),
    end: jest.fn(),
  };

  return {
    Pool: jest.fn(() => mPool),
  };
});

describe('Mocked controllers', () => {
  let pool;
  const req = mockRequest();
  const res = mockResponse();

  beforeEach(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns a succesful mocked response', async () => {
      req.query.longitude = [];
      req.query.latitude = [];

      jest.spyOn(controller, 'generateGeoData').mockImplementation(() => jest.fn());

      pool.query = jest.fn().mockReturnValue({
        rows: [
          {
            index: 1,
            st_asgeojson: '{"test": true}',
          },
        ],
      });

      await controller.getAll(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              description: 1,
            },
            geometry: { test: true },
          },
        ],
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns the correct status for a failed request', async () => {
      pool.query = jest.fn().mockReturnValue(null);
      await controller.getAll(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        data: 'No data',
        success: false,
      });
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getZipLayer', () => {
    it('returns a succesful mocked response', async () => {
      jest.spyOn(controller, 'generateZipData').mockImplementation(() => jest.fn());

      pool.query = jest.fn().mockReturnValue({
        rows: [
          {
            zip: 1,
            st_asgeojson: '{"test": true}',
          },
        ],
      });

      await controller.getZipLayer(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              zipcode: 1,
            },
            geometry: { test: true },
          },
        ],
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns the correct status for a failed request', async () => {
      pool.query = jest.fn().mockReturnValue(null);
      await controller.getZipLayer(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        data: 'No data',
        success: false,
      });
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getPointData', () => {
    it('returns a succesful mocked response', async () => {
      req.query.index = 1;

      pool.query = jest.fn().mockReturnValue({
        rows: [1, 2, 3],
      });

      await controller.getPointData(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns the correct status for a failed request', async () => {
      pool.query = jest.fn().mockReturnValue(null);
      await controller.getPointData(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        data: 'No data',
        success: false,
      });
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getTimestamps', () => {
    it('returns a succesful mocked response', async () => {
      req.query.longitude = [];
      req.query.latitude = [];
      req.query.startDate = '2020-01-01';
      req.query.endDate = '2021-01-01';

      jest.spyOn(controller, 'generateGeoData').mockImplementation(() => jest.fn());

      pool.query = jest.fn().mockReturnValue({
        rows: [
          {
            index: 1,
            st_asgeojson: '{"test": true}',
          },
        ],
      });

      await controller.getTimestamps(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              description: 1,
            },
            geometry: { test: true },
          },
        ],
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns the correct status for a failed request', async () => {
      pool.query = jest.fn().mockReturnValue(null);
      await controller.getTimestamps(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        data: 'No data',
        success: false,
      });
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('drawSelect', () => {
    it('returns a succesful mocked response', async () => {
      req.query.polygon = [];

      jest.spyOn(controller, 'generateGeoData').mockImplementation(() => jest.fn());

      pool.query = jest.fn().mockReturnValue({
        rows: [
          {
            index: 1,
            st_asgeojson: '{"test": true}',
          },
        ],
      });

      await controller.drawSelect(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              description: 1,
            },
            geometry: { test: true },
          },
        ],
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns the correct status for a failed request', async () => {
      pool.query = jest.fn().mockReturnValue(null);
      await controller.drawSelect(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        data: 'No data',
        success: false,
      });
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('zipSelect', () => {
    it('returns a succesful mocked response', async () => {
      req.query.zip = '1';

      jest.spyOn(controller, 'generateGeoData').mockImplementation(() => jest.fn());

      pool.query = jest.fn().mockReturnValue({
        rows: [
          {
            index: 1,
            st_asgeojson: '{"test": true}',
          },
        ],
      });

      await controller.zipSelect(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              description: 1,
            },
            geometry: { test: true },
          },
        ],
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns the correct status for a failed request', async () => {
      pool.query = jest.fn().mockReturnValue(null);
      await controller.zipSelect(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        data: 'No data',
        success: false,
      });
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('graph', () => {
    it('returns a succesful mocked response', async () => {
      req.query.polygon = [];
      req.query.filterBy = 'string';

      pool.query = jest.fn().mockReturnValue({
        rows: [1, 2, 3],
      });

      await controller.graph(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns the correct status for a failed request', async () => {
      pool.query = jest.fn().mockReturnValue(null);
      await controller.graph(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        data: 'No data',
        success: false,
      });
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('zipGraph', () => {
    it('returns a succesful mocked response', async () => {
      req.query.polygon = [];
      req.query.filterBy = 'string';

      pool.query = jest.fn().mockReturnValue({
        rows: [1, 2, 3],
      });

      await controller.zipGraph(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith([1, 2, 3]);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns the correct status for a failed request', async () => {
      pool.query = jest.fn().mockReturnValue(null);
      await controller.zipGraph(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith({
        data: 'No data',
        success: false,
      });
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
