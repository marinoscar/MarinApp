import { useCallback, useEffect, useState } from "react";
import { CredentialResponse } from "@react-oauth/google";
import { authService, ProfileResponse } from "../services/authService";
import { tokenStorage } from "../services/tokenStorage";

export const useAuthSession = () => {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (accessToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.fetchProfile(accessToken);
      setProfile(data);
    } catch (err) {
      setProfile(null);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      void loadProfile(token);
    } else {
      setProfile(null);
    }
  }, [token, loadProfile]);

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError("Google sign-in did not return a credential.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const authResponse = await authService.exchangeGoogleToken(response.credential);
      tokenStorage.set(authResponse.accessToken);
      setToken(authResponse.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed.");
  };

  const handleLogout = () => {
    tokenStorage.clear();
    setToken(null);
    setProfile(null);
  };

  return {
    token,
    profile,
    loading,
    error,
    handleGoogleSuccess,
    handleGoogleError,
    handleLogout
  };
};
