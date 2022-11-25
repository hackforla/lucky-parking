const { Pool } = require('pg');
let pool = require('../db');

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

describe('Mocked PostgreSQL', () => {
  beforeEach(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect properly', () => {
    expect(pool.connect).toHaveBeenCalledTimes(1);
  });
});
