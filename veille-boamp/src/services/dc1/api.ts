import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Custom error class for quota exceeded
export class QuotaExceededError extends Error {
  used: number;
  limit: number;

  constructor(message: string, used: number, limit: number) {
    super(message);
    this.name = 'QuotaExceededError';
    this.used = used;
    this.limit = limit;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for quota exceeded (403 with quotaExceeded flag)
    if (error.response?.status === 403 && error.response?.data?.quotaExceeded) {
      const { used, limit } = error.response.data;
      return Promise.reject(new QuotaExceededError('Quota dépassé', used, limit));
    }

    const message = error.response?.data?.message || error.response?.data?.error || 'Une erreur est survenue';
    return Promise.reject(new Error(message));
  }
);
