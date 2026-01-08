/**
 * API Service for ePerolehan Scraper Frontend
 * Connects to FastAPI backend
 */

// Use relative URL in production (empty string = same origin via nginx)
// Only use localhost:8000 for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface Tender {
  id: string;
  quotation_number: string;
  category_code: string;
  category_name?: string;
  summary: string;
  description?: string;
  amount?: number;
  ministry_name?: string;
  ministry_department?: string;
  ministry_contact?: string;
  ministry_phone?: string;
  ministry_location?: string;
  date_published?: string;
  date_closing: string;
  date_briefing?: string;
  days_remaining?: number;
  tags: string[];
  status: 'available' | 'accepted' | 'onhold' | 'removed';
  is_urgent: boolean;
  budget_code?: string;
  payment_terms?: string;
  notes?: string;
  scraped_at: string;
  updated_at: string;
  field_codes?: string[];
  contact_details?: {
    name: string;
    phone: string;
    email?: string;
  }[];
}

export interface TenderDocument {
  id: string;
  tender_id: string;
  name: string;
  size: string;
  url: string;
}

export interface TenderActivity {
  id: string;
  tender_id: string;
  action: string;
  user_name?: string;
  timestamp: string;
}

export interface ScrapeLog {
  id: string;
  scrape_time: string;
  tenders_found: number;
  new_tenders: number;
  updated_tenders: number;
  errors?: string;
  duration_seconds: number;
  status: 'success' | 'failed' | 'partial';
}

export interface Category {
  code: string;
  name: string;
  enabled: boolean;
  keywords?: string[];
}

export interface Stats {
  total: number;
  available: number;
  accepted: number;
  onhold: number;
  removed: number;
  urgent: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ==================== TENDERS ====================

  async getTenders(status?: string, limit: number = 100): Promise<{ success: boolean; count: number; tenders: Tender[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());

    return this.request(`/api/tenders?${params}`);
  }

  async getTender(quotationNumber: string): Promise<{
    success: boolean;
    tender: Tender;
    documents: TenderDocument[];
    activity: TenderActivity[];
  }> {
    return this.request(`/api/tenders/${quotationNumber}`);
  }

  async updateTender(
    quotationNumber: string,
    data: { status?: string; notes?: string }
  ): Promise<{ success: boolean; tender: Tender }> {
    return this.request(`/api/tenders/${quotationNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ==================== STATISTICS ====================

  async getStats(): Promise<{ success: boolean; stats: Stats }> {
    return this.request('/api/stats');
  }

  // ==================== SCRAPING ====================

  async triggerScrape(): Promise<{ success: boolean; message: string; status: string }> {
    return this.request('/api/scrape', {
      method: 'POST',
    });
  }

  async getScrapeStatus(): Promise<{
    success: boolean;
    is_running: boolean;
    last_scrape: ScrapeLog | null;
  }> {
    return this.request('/api/scrape/status');
  }

  async getScrapeHistory(limit: number = 10): Promise<{
    success: boolean;
    count: number;
    history: ScrapeLog[];
  }> {
    return this.request(`/api/scrape/history?limit=${limit}`);
  }

  // ==================== CATEGORIES ====================

  async getCategories(): Promise<{ success: boolean; count: number; categories: Category[] }> {
    return this.request('/api/categories');
  }

  async toggleCategory(code: string, enabled: boolean): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/categories/${code}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    });
  }

  // ==================== SEARCH ====================

  async searchTenders(query: string, categories?: string[]): Promise<{
    success: boolean;
    count: number;
    results: Tender[];
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (categories && categories.length > 0) {
      params.append('categories', categories.join(','));
    }

    return this.request(`/api/search?${params}`);
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck(): Promise<{ status: string; service: string; version: string; timestamp: string }> {
    return this.request('/');
  }
}

export const api = new ApiService();
export default api;
