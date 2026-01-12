import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { loadAppConfig } from "./config";
import { setApiBaseUrl } from "./services/apiClient";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const bootstrap = async (): Promise<void> => {
  const config = await loadAppConfig();

  setApiBaseUrl(config.apiBaseUrl);

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={config.googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
};

bootstrap().catch((error) => {
  console.error("Failed to start the app:", error);
});
