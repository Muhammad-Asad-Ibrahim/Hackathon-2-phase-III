/**
 * API service for chat functionality
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

class ChatApi {
  constructor() {
    // Token will be retrieved from localStorage when needed
  }

  /**
   * Get authentication token from localStorage or cookies
   */
  getToken() {
    // Try to get token from localStorage (using the same key as useAuth hook)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Process a chat message
   */
  async processMessage(message, sessionId = null) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get user's chat sessions
   */
  async getUserSessions() {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get messages for a specific session
   */
  async getSessionMessages(sessionId, limit = 50, offset = 0) {
    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/chat/session/${sessionId}/messages?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get available tools
   */
  async getAvailableTools() {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/tools`, {
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export default new ChatApi();