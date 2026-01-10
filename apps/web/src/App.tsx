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
import { ClipboardView } from "./components/ClipboardView";
import { authService, ProfileResponse } from "./services/authService";
import { clipboardService, ClipboardItem } from "./services/clipboardService";
import { tokenStorage } from "./services/tokenStorage";
import { createAppTheme, ThemeMode } from "./theme/theme";

const App = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);
  const [clipboardLoading, setClipboardLoading] = useState(false);
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  const [textTitle, setTextTitle] = useState("");
  const [textMarkdown, setTextMarkdown] = useState("");
  const [fileUploadTitle, setFileUploadTitle] = useState("");
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || "/");

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

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setCurrentPath(path);
  }, []);

  useEffect(() => {
    if (currentPath !== "/" && currentPath !== "/clipboard") {
      navigate("/");
    }
  }, [currentPath, navigate]);

  const loadClipboard = useCallback(
    async (accessToken: string) => {
      setClipboardLoading(true);
      setClipboardError(null);
      try {
        const data = await clipboardService.list(accessToken);
        setClipboardItems(data.items);
      } catch (err) {
        setClipboardError(err instanceof Error ? err.message : "Failed to load clipboard");
      } finally {
        setClipboardLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (token) {
      void loadClipboard(token);
    } else {
      setClipboardItems([]);
    }
  }, [token, loadClipboard]);

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

  const handleSaveText = async () => {
    if (!token || !textMarkdown.trim()) {
      return;
    }

    setClipboardLoading(true);
    setClipboardError(null);
    try {
      await clipboardService.createText(token, {
        title: textTitle.trim() || undefined,
        markdownContent: textMarkdown
      });
      setTextTitle("");
      setTextMarkdown("");
      await loadClipboard(token);
    } catch (err) {
      setClipboardError(err instanceof Error ? err.message : "Failed to save text");
    } finally {
      setClipboardLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    if (!navigator.clipboard?.readText) {
      setClipboardError("Clipboard access is not available in this browser.");
      return;
    }

    try {
      const clipText = await navigator.clipboard.readText();
      setTextMarkdown((current) => `${current}${current ? "\n" : ""}${clipText}`);
    } catch (err) {
      setClipboardError(err instanceof Error ? err.message : "Failed to read clipboard");
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!token || files.length === 0) {
      return;
    }

    setClipboardLoading(true);
    setClipboardError(null);
    try {
      for (const file of files) {
        await clipboardService.uploadFile(token, file, fileUploadTitle.trim() || undefined);
      }
      setFileUploadTitle("");
      await loadClipboard(token);
    } catch (err) {
      setClipboardError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setClipboardLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!token) {
      return;
    }

    setClipboardLoading(true);
    setClipboardError(null);
    try {
      await clipboardService.deleteItem(token, itemId);
      await loadClipboard(token);
    } catch (err) {
      setClipboardError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setClipboardLoading(false);
    }
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
        activePath={currentPath}
        onNavigate={navigate}
        onLogout={handleLogout}
      >
        <Container maxWidth="md">
          <Stack spacing={3}>
            {currentPath === "/clipboard" ? (
              token && profile ? (
                <ClipboardView
                  items={clipboardItems}
                  loading={clipboardLoading}
                  error={clipboardError}
                  textTitle={textTitle}
                  textMarkdown={textMarkdown}
                  fileTitle={fileUploadTitle}
                  onTextTitleChange={setTextTitle}
                  onTextMarkdownChange={setTextMarkdown}
                  onFileTitleChange={setFileUploadTitle}
                  onSaveText={handleSaveText}
                  onPasteFromClipboard={handlePasteFromClipboard}
                  onFilesSelected={handleFileUpload}
                  onDeleteItem={handleDeleteItem}
                />
              ) : (
                <Alert severity="info">Please sign in to access the clipboard.</Alert>
              )
            ) : (
              <Stack spacing={3}>
                <Typography variant="h4" component="h1">
                  Welcome to MarinApp
                </Typography>
                <Typography color="text.secondary">
                  This MVP validates Google sign-in, issues a secure API token, and fetches your
                  profile from the backend.
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
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => setError("Google sign-in failed.")}
                        />
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
            )}
          </Stack>
        </Container>
      </AppShell>
    </ThemeProvider>
  );
};

export default App;
