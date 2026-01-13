import { useMemo, useState } from "react";
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
import { GoogleLogin } from "@react-oauth/google";
import { AppShell } from "./components/AppShell";
import { ClipboardView } from "./components/ClipboardView";
import { useAppNavigation } from "./hooks/useAppNavigation";
import { useAuthSession } from "./hooks/useAuthSession";
import { useClipboard } from "./hooks/useClipboard";
import { createAppTheme, ThemeMode } from "./theme/theme";

const App = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const { currentPath, navigate } = useAppNavigation();
  const {
    token,
    profile,
    loading,
    error,
    handleGoogleSuccess,
    handleGoogleError,
    handleLogout
  } = useAuthSession();
  const {
    items: clipboardItems,
    loading: clipboardLoading,
    error: clipboardError,
    hubStatus: clipboardHubStatus,
    textTitle,
    textMarkdown,
    fileUploadTitle,
    setTextTitle,
    setTextMarkdown,
    setFileUploadTitle,
    handleSaveText,
    handlePasteFromClipboard,
    handlePasteClipboardItem,
    handlePasteText,
    handleFileUpload,
    handleDeleteItem
  } = useClipboard(token, currentPath === "/clipboard");

  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

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
                  realtimeDisconnected={clipboardHubStatus === "disconnected"}
                  textTitle={textTitle}
                  textMarkdown={textMarkdown}
                  fileTitle={fileUploadTitle}
                  onTextTitleChange={setTextTitle}
                  onTextMarkdownChange={setTextMarkdown}
                  onFileTitleChange={setFileUploadTitle}
                  onSaveText={handleSaveText}
                  onPasteFromClipboard={handlePasteFromClipboard}
                  onPasteClipboardItem={handlePasteClipboardItem}
                  onFilesSelected={handleFileUpload}
                  onPasteText={handlePasteText}
                  onDeleteItem={handleDeleteItem}
                />
              ) : (
                <Alert severity="info">Please sign in to access the clipboard.</Alert>
              )
            ) : (
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    component="img"
                    src="/android-chrome-512x512.png"
                    alt="Marin App logo"
                    sx={{ width: 64, height: 64, borderRadius: 2 }}
                  />
                  <Typography variant="h4" component="h1">
                    Welcome to Marin App
                  </Typography>
                </Stack>
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
                          onError={handleGoogleError}
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
