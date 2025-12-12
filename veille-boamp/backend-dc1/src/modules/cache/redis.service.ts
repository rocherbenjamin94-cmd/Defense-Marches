import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
    private client: Redis | null = null;
    private readonly logger = new Logger(RedisService.name);

    onModuleInit() {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            this.logger.warn('REDIS_URL non définie, cache Redis désactivé');
            return;
        }

        this.client = new Redis(redisUrl, {
            tls: { rejectUnauthorized: false },
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) {
                    this.logger.error('Redis: Nombre max de tentatives atteint');
                    return null;
                }
                return Math.min(times * 200, 2000);
            },
        });

        this.client.on('connect', () => {
            this.logger.log('✅ Redis connecté (Upstash)');
        });

        this.client.on('error', (err) => {
            this.logger.error('❌ Redis erreur:', err.message);
        });

        this.client.on('ready', () => {
            this.logger.log('Redis prêt à recevoir des commandes');
        });
    }

    isConnected(): boolean {
        return this.client !== null && this.client.status === 'ready';
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.client) return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            this.logger.error(`Erreur get Redis pour ${key}:`, error);
            return null;
        }
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        if (!this.client) return;
        try {
            const data = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setex(key, ttlSeconds, data);
            } else {
                await this.client.set(key, data);
            }
        } catch (error) {
            this.logger.error(`Erreur set Redis pour ${key}:`, error);
        }
    }

    async delete(key: string): Promise<void> {
        if (!this.client) return;
        try {
            await this.client.del(key);
        } catch (error) {
            this.logger.error(`Erreur delete Redis pour ${key}:`, error);
        }
    }

    async keys(pattern: string): Promise<string[]> {
        if (!this.client) return [];
        try {
            return await this.client.keys(pattern);
        } catch (error) {
            this.logger.error(`Erreur keys Redis pour ${pattern}:`, error);
            return [];
        }
    }

    async getStats(): Promise<{ connected: boolean; keys: number }> {
        if (!this.client) {
            return { connected: false, keys: 0 };
        }
        try {
            const allKeys = await this.client.keys('analyse:*');
            return { connected: true, keys: allKeys.length };
        } catch {
            return { connected: false, keys: 0 };
        }
    }
}
