import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

if (import.meta.env.DEV) {
  console.debug("VITE_GOOGLE_CLIENT_ID:", googleClientId);
}

if (!googleClientId) {
  throw new Error("VITE_GOOGLE_CLIENT_ID is required for Google OAuth");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
