// src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

class Api {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
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

  // ==================== AUTH APIs ====================
  
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

  // ==================== USER APIs ====================
  
  async getAllUsers() {
    return this.request('/users/all', 'GET');
  }

  async getAllBuyers() {
    return this.request('/users/buyers', 'GET');
  }

  async getAllRealtors() {
    return this.request('/users/realtors', 'GET');
  }

  async getUserById(userId: string) {
    return this.request(`/users/${userId}`, 'GET');
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, 'DELETE');
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.request(`/users/${userId}/status`, 'PUT', { isActive });
  }

  async getRealtorById(id: string) {
    return this.request(`/users/realtors/${id}`, 'GET');
  }

  async updateRealtor(id: string, data: any) {
    return this.request(`/users/realtors/${id}`, 'PUT', data);
  }

  // ==================== PROPERTY APIs ====================
  
  async getAllProperties(queryParams?: string) {
    const url = queryParams ? `/property/all?${queryParams}` : '/property/all';
    return this.request(url, 'GET');
  }

  async getPropertyById(propertyId: string) {
    return this.request(`/property/public/${propertyId}`, 'GET');
  }

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

  // ==================== LEAD APIs ====================
  
  async getAllLeads(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const url = queryString ? `/leads?${queryString}` : '/leads';
    return this.request(url, 'GET');
  }

  async createLead(leadData: any) {
    return this.request('/leads', 'POST', leadData);
  }

  async updateLead(id: string, leadData: any) {
    return this.request(`/leads/${id}`, 'PUT', leadData);
  }

  async deleteLead(id: string) {
    return this.request(`/leads/${id}`, 'DELETE');
  }

  async assignLead(id: string, realtorId: string) {
    return this.request(`/leads/${id}/assign`, 'PUT', { realtorId });
  }

  async updateLeadStage(id: string, stage: string) {
    return this.request(`/leads/${id}/stage`, 'PUT', { stage });
  }

  // ==================== LEAD REQUESTS APIs ====================
  
  async getAllLeadRequests(status?: string, page: number = 1, limit: number = 20) {
    let url = `/lead-requests?page=${page}&limit=${limit}`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    return this.request(url, 'GET');
  }

  async getLeadRequestById(requestId: string) {
    return this.request(`/lead-requests/${requestId}`, 'GET');
  }

  async approveLeadRequest(requestId: string, leadIds?: string[]) {
    const body: any = {};
    if (leadIds && leadIds.length > 0) {
      body.leadIds = leadIds;
    }
    return this.request(`/lead-requests/${requestId}/approve`, 'PUT', body);
  }

  async rejectLeadRequest(requestId: string, rejectionReason: string) {
    return this.request(`/lead-requests/${requestId}/reject`, 'PUT', { rejectionReason });
  }

  async deleteLeadRequest(requestId: string) {
    return this.request(`/lead-requests/${requestId}`, 'DELETE');
  }

  async getPendingRequestsCount() {
    return this.request('/lead-requests/pending/count', 'GET');
  }

  // ==================== PAYMENT APIs ====================
  
  // Get all payments (admin)
  async getPayments(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const url = queryString ? `/payments?${queryString}` : '/payments';
    return this.request(url, 'GET');
  }

  // Get sales stats (admin)
  async getSalesStats() {
    return this.request('/payments/stats', 'GET');
  }

  // Create payment (after in-app purchase)
  async createPayment(paymentData: any) {
    return this.request('/payments', 'POST', paymentData);
  }
  async getMyPayments() {
    return this.request('/payments/my-payments', 'GET');
  }
  async checkSubscriptionStatus() {
    return this.request('/payments/subscription/status', 'GET');
  }
  async getPaymentById(paymentId: string) {
    return this.request(`/payments/${paymentId}`, 'GET');
  }
  async updatePaymentStatus(paymentId: string, status: string) {
    return this.request(`/payments/${paymentId}/status`, 'PUT', { status });
  }

// ==================== NOTIFICATION APIs ====================

// Get all notifications
async getNotifications(page: number = 1, limit: number = 20, unreadOnly: boolean = false) {
  const url = `/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`;
  return this.request(url, 'GET');
}

// Get unread count only
async getUnreadNotificationCount() {
  return this.request('/notifications/unread/count', 'GET');
}

// Mark notification as read
async markNotificationAsRead(notificationId: string) {
  return this.request(`/notifications/${notificationId}/read`, 'PUT');
}

// Mark all notifications as read
async markAllNotificationsAsRead() {
  return this.request('/notifications/read/all', 'PUT');
}

// Delete notification
async deleteNotification(notificationId: string) {
  return this.request(`/notifications/${notificationId}`, 'DELETE');
}

  // Add this method to your Api class

// Get admin dashboard stats
async getDashboardStats() {
  return this.request('/admindashboard/admin/stats', 'GET');
}

  
  logout() {
    this.clearToken();
  }
}

export const api = new Api();
export default api;