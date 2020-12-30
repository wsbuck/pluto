import redis from 'redis';
import { promisify } from 'util';
import IPosition from '../interfaces/IPosition';
import { REDIS_HOST, REDIS_PORT } from '../config';
import QuoteService from '../services/quote';

const quoteService = new QuoteService();

interface IPositionService {
  createPosition(position: IPosition): Promise<void>;
  getPositions(user: string): Promise<IPosition[]>;
}

export default class PositionService implements IPositionService {
  redis: redis.RedisClient;
  lrange: (key: string, start: number, end: number) => Promise<string[]>;
  lpush: (key: string, value: string) => Promise<number>;

  constructor() {
    this.redis = redis.createClient({
      port: REDIS_PORT || 6379,
      host: REDIS_HOST || 'localhost',
    });

    this.lpush = promisify(this.redis.lpush).bind(this.redis);
    this.lrange = promisify(this.redis.lrange).bind(this.redis);
  }

  async createPosition(position: IPosition): Promise<void> {
    const key = `${position.user}-positions`;
    const positions = await this.getPositions(position.user);
    const exists = positions.some(existingPosition => (
        position.ticker === existingPosition.ticker &&
        position.sentiment === existingPosition.sentiment
    ));

    if (exists) {
      return;
    }

    await this.lpush(key, JSON.stringify(position));
  }

  async getPositions(user: string): Promise<IPosition[]> {
    const key = `${user}-positions`;

    const values = await this.lrange(key, 0, -1);
    const positions = values.map((value) => JSON.parse(value)) as IPosition[];
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const currentPrice = await quoteService.fetchStockQuote(position.ticker);
      position.currentPrice = currentPrice;
    }
    return positions;
  }

}
