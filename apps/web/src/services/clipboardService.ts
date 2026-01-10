import { API_BASE_URL, apiClient } from "./apiClient";

export interface ClipboardItem {
  id: string;
  itemType: string;
  title?: string | null;
  markdownContent?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  fileSizeBytes?: number | null;
  previewUrl?: string | null;
  createdAt: string;
}

export interface ClipboardListResponse {
  items: ClipboardItem[];
}

export interface ClipboardTextCreateRequest {
  title?: string | null;
  markdownContent: string;
}

export interface ClipboardCreateResponse {
  id: string;
}

export const clipboardService = {
  async list(token: string): Promise<ClipboardListResponse> {
    return apiClient.get<ClipboardListResponse>("/api/clipboard", token);
  },

  async createText(token: string, request: ClipboardTextCreateRequest): Promise<ClipboardCreateResponse> {
    return apiClient.post<ClipboardCreateResponse>("/api/clipboard/text", request, token);
  },

  async uploadFile(
    token: string,
    file: File,
    title?: string | null
  ): Promise<ClipboardCreateResponse> {
    const formData = new FormData();
    formData.append("file", file);
    if (title) {
      formData.append("title", title);
    }

    const response = await fetch(`${API_BASE_URL}/api/clipboard/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Failed to upload file");
    }

    return (await response.json()) as ClipboardCreateResponse;
  },

  async deleteItem(token: string, itemId: string): Promise<void> {
    await apiClient.delete(`/api/clipboard/${itemId}`, token);
  }
};
