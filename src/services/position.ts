import redis from 'redis';
import { promisify } from 'util';
import IPosition from '../interfaces/IPosition';
import { REDIS_HOST, REDIS_PORT } from '../config';

interface IPositionService {
  createPosition(position: IPosition): Promise<void>;
  getPositions(user: string): Promise<IPosition[]>;
}

export default class PositionService implements IPositionService {
  redis: redis.RedisClient;
  lpush: () => Promise<number>;
  lrange: (key: string, start: number, end: number) => Promise<string[]>;

  constructor() {
    this.redis = redis.createClient({
      port: REDIS_PORT || 6379,
      host: REDIS_HOST || 'localhost',
    });

    this.lpush = promisify(this.redis.lpush);
    this.lrange = promisify(this.redis.lrange);
  }

  async createPosition(position: IPosition): Promise<void> {
    const key = `${position.user}-positions`;
    this.redis.lpush(key, JSON.stringify(position));
  }

  async getPositions(user: string): Promise<IPosition[]> {
    const key = `${user}-positions`;
    const positions: IPosition[] = await this.lrange(key, 0, -1)
      .then((values) => values.map((value) => JSON.parse(value)));

    return positions;
  }

}
