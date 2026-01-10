import { apiClient } from "./apiClient";

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export interface ProfileResponse {
  userId: string;
  name?: string | null;
  email?: string | null;
  pictureUrl?: string | null;
}

export const authService = {
  async exchangeGoogleToken(idToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/api/auth/google", { idToken });
  },
  async fetchProfile(token: string): Promise<ProfileResponse> {
    return apiClient.get<ProfileResponse>("/api/profile/me", token);
  }
};
