export class ApiClient {
  private readonly getBaseUrl: () => string;

  constructor(getBaseUrl: () => string) {
    this.getBaseUrl = getBaseUrl;
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

    const response = await fetch(`${this.getBaseUrl()}${path}`, {
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

let apiBaseUrl = "http://localhost:5143";

export const setApiBaseUrl = (value: string): void => {
  apiBaseUrl = value.replace(/\/$/, "");
};

export const getApiBaseUrl = (): string => apiBaseUrl;

export const apiClient = new ApiClient(getApiBaseUrl);
