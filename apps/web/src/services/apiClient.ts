export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async get<T>(path: string, token?: string): Promise<T> {
    return this.request<T>(path, {
      method: "GET",
      token
    });
  }

  async post<T>(path: string, body: unknown, token?: string): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body,
      token
    });
  }

  async delete(path: string, token?: string): Promise<void> {
    await this.request<void>(path, {
      method: "DELETE",
      token
    });
  }

  private async request<T>(
    path: string,
    options: {
      method: "GET" | "POST" | "DELETE";
      body?: unknown;
      token?: string;
    }
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Request failed");
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:5143";

export const apiClient = new ApiClient(API_BASE_URL);
