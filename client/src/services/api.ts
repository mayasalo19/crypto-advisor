import axios from 'axios';

// Read the URL from Vercel environment variables, fallback to local server
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor: attaches JWT token to protected requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PreferencesData {
  interested_assets: string[];
  investor_type: string;
  content_types: string[];
}

export const authApi = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  savePreferences: (data: PreferencesData) => api.post('/preferences', data),
  getPreferences: () => api.get('/preferences'),
  getPrices: (symbols: string[]) => {
    const query = symbols.map((s) => `symbols=${encodeURIComponent(s)}`).join('&');
    return api.get<CoinPrice[]>(`/prices?${query}`);
  },
  getNews: (currencies: string[]) => {
  const query = currencies.map((c) => `currencies=${encodeURIComponent(c)}`).join('&');
  return api.get<NewsArticle[]>(`/news?${query}`);
},
};

export default api;

export interface CoinPrice {
  symbol: string;
  price_usd: number;
  change_24h: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  currencies: string[];
}


export interface InsightsRequest {
  investor_type: string;
  interested_assets: string[];
}

export interface InsightsResponse {
  investor_type: string;
  assets_evaluated: string[];
  sentiment: string;
  analysis: string;
  recommendation: string;
}

export const fetchMarketInsights = async (payload: InsightsRequest): Promise<InsightsResponse> => {
  const response = await fetch(`${BASE_URL}/insights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch market insights");
  }

  return response.json();
};


export interface CryptoMeme {
  id: string;
  title: string;
  image_url: string;
  author: string;
  permalink?: string;
}

export const getCryptoMeme = async (): Promise<CryptoMeme> => {
  const response = await fetch(`${BASE_URL}/meme`);
  if (!response.ok) {
    throw new Error("Failed to load meme");
  }
  return response.json();
};


export interface VotePayload {
  user_id: string;
  section: 'insights' | 'prices' | 'news' | 'meme';
  vote: 1 | -1;
  item_id?: string;
}

export const submitVote = async (payload: VotePayload): Promise<void> => {
  const response = await fetch(`${BASE_URL}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to submit vote");
  }
};