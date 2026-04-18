// src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

class Api {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Try to get token from cookie first
      const cookieToken = this.getCookie('token');
      if (cookieToken) {
        this.token = cookieToken;
      } else {
        this.token = localStorage.getItem('token');
      }
    }
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      // Also set cookie
      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  private async request(endpoint: string, method: string, body?: any) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  async adminLogin(email: string, password: string) {
    const response = await this.request('/auth/admin/login', 'POST', { email, password });
    if (response.token) {
      this.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  }

  async adminRegister(name: string, email: string, phone: string, password: string, secretKey: string) {
    return this.request('/auth/admin/register', 'POST', { name, email, phone, password, secretKey });
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', 'POST', { email, password });
    if (response.token) {
      this.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  }

  async signup(name: string, email: string, phone: string, password: string) {
    return this.request('/auth/signup', 'POST', { name, email, phone, password });
  }

  async getProfile() {
    return this.request('/auth/profile', 'GET');
  }

  async getAllUsers() {
  return this.request('/users/all', 'GET');
}

// Get all buyers
async getAllBuyers() {
  return this.request('/users/buyers', 'GET');
}

// Get all realtors
async getAllRealtors() {
  return this.request('/users/realtors', 'GET');
}

// Get user by ID
async getUserById(userId: string) {
  return this.request(`/users/${userId}`, 'GET');
}

// Delete user
async deleteUser(userId: string) {
  return this.request(`/users/${userId}`, 'DELETE');
}

// Update user status
async updateUserStatus(userId: string, isActive: boolean) {
  return this.request(`/users/${userId}/status`, 'PUT', { isActive });
}
// Add to your Api class in api.ts
async getRealtorById(id: string) {
  return this.request(`/users/realtors/${id}`, 'GET');
}

// Update realtor
async updateRealtor(id: string, data: any) {
  return this.request(`/users/realtors/${id}`, 'PUT', data);
}

// Add to Api class in api.ts

// Get all properties with pagination and filters
async getAllProperties(queryParams?: string) {
  const url = queryParams ? `/property/all?${queryParams}` : '/property/all';
  return this.request(url, 'GET');
}

// Get property by ID
async getPropertyById(propertyId: string) {
  return this.request(`/property/public/${propertyId}`, 'GET');
}

// Add Property
async addProperty(propertyData: any) {
  return this.request('/property/add', 'POST', propertyData);
}
async addPropertyWithImages(formData: FormData) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/property/add`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  return response.json();
}
// Get all leads with pagination and filters
async getAllLeads(params?: any) {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const url = queryString ? `/leads?${queryString}` : '/leads';
  return this.request(url, 'GET');
}

// Create new lead
// async createLead(leadData: any) {
//   return this.request('/leads', 'POST', leadData);
// }

// Update lead
async updateLead(id: string, leadData: any) {
  return this.request(`/leads/${id}`, 'PUT', leadData);
}

// Delete lead
async deleteLead(id: string) {
  return this.request(`/leads/${id}`, 'DELETE');
}

// Assign lead to realtor
// async assignLead(id: string, realtorId: string) {
//   return this.request(`/leads/${id}/assign`, 'PUT', { realtorId });
// }

// Update lead stage
async updateLeadStage(id: string, stage: string) {
  return this.request(`/leads/${id}/stage`, 'PUT', { stage });
}
async createLead(leadData: any) {
  return this.request('/leads', 'POST', leadData);
}

// ==================== LEAD REQUESTS API ====================

// Get all lead requests (admin)
async getAllLeadRequests(status?: string, page: number = 1, limit: number = 20) {
  let url = `/lead-requests?page=${page}&limit=${limit}`;
  if (status && status !== 'all') {
    url += `&status=${status}`;
  }
  return this.request(url, 'GET');
}

// Get single lead request
async getLeadRequestById(requestId: string) {
  return this.request(`/lead-requests/${requestId}`, 'GET');
}

// Approve lead request
async approveLeadRequest(requestId: string, leadIds?: string[]) {
  const body: any = {};
  if (leadIds && leadIds.length > 0) {
    body.leadIds = leadIds;
  }
  return this.request(`/lead-requests/${requestId}/approve`, 'PUT', body);
}

// Reject lead request
async rejectLeadRequest(requestId: string, rejectionReason: string) {
  return this.request(`/lead-requests/${requestId}/reject`, 'PUT', { rejectionReason });
}

// Delete lead request
async deleteLeadRequest(requestId: string) {
  return this.request(`/lead-requests/${requestId}`, 'DELETE');
}
// Assign lead to realtor
async assignLead(id: string, realtorId: string) {
  return this.request(`/leads/${id}/assign`, 'PUT', { realtorId });
}

// Get all realtors (for dropdown)

// Get pending requests count
async getPendingRequestsCount() {
  return this.request('/lead-requests/pending/count', 'GET');
}
  logout() {
    this.clearToken();
  }
}

export const api = new Api();
export default api;