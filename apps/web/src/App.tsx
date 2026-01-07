import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  CssBaseline,
  Stack,
  ThemeProvider,
  Typography
} from "@mui/material";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { AppShell } from "./components/AppShell";
import { authService, ProfileResponse } from "./services/authService";
import { tokenStorage } from "./services/tokenStorage";
import { createAppTheme, ThemeMode } from "./theme/theme";

const App = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  const loadProfile = useCallback(
    async (accessToken: string) => {
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
    },
    []
  );

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

  const handleLogout = () => {
    tokenStorage.clear();
    setToken(null);
    setProfile(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell
        themeMode={themeMode}
        onToggleTheme={() =>
          setThemeMode((current) => (current === "dark" ? "light" : "dark"))
        }
        user={profile}
        onLogout={handleLogout}
      >
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Typography variant="h4" component="h1">
              Welcome to MarinApp
            </Typography>
            <Typography color="text.secondary">
              This MVP validates Google sign-in, issues a secure API token, and fetches your profile
              from the backend.
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {loading && (
              <Box display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            )}
            {!token && !loading && (
              <Card>
                <CardContent>
                  <Stack spacing={2} alignItems="flex-start">
                    <Typography variant="h6">Sign in with Google</Typography>
                    <Typography color="text.secondary">
                      Use your Google account to authenticate and receive an API token.
                    </Typography>
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google sign-in failed.")} />
                  </Stack>
                </CardContent>
              </Card>
            )}
            {token && profile && !loading && (
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Authenticated</Typography>
                    <Typography color="text.secondary">User ID: {profile.userId}</Typography>
                    <Typography>Name: {profile.name ?? "Unknown"}</Typography>
                    <Typography>Email: {profile.email ?? "Unknown"}</Typography>
                    <Button variant="outlined" onClick={handleLogout}>
                      Log out
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}
            {token && !profile && !loading && (
              <Alert severity="info">No profile data available. Try signing in again.</Alert>
            )}
          </Stack>
        </Container>
      </AppShell>
    </ThemeProvider>
  );
};

export default App;
