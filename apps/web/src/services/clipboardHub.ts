import { getApiBaseUrl } from "./apiClient";

type HubConnection = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  on: (eventName: string, callback: () => void) => void;
  off: (eventName: string, callback: () => void) => void;
  onclose: (callback: () => void) => void;
  onreconnecting: (callback: () => void) => void;
  onreconnected: (callback: () => void) => void;
};

type SignalRGlobal = {
  HubConnectionBuilder: new () => {
    withUrl: (url: string, options?: { accessTokenFactory?: () => string }) => unknown;
    withAutomaticReconnect: () => unknown;
    configureLogging: (level: number) => unknown;
    build: () => HubConnection;
  };
  LogLevel: {
    Warning: number;
  };
};

export const createClipboardHubConnection = (token: string): HubConnection => {
  const signalR = window.signalR as SignalRGlobal | undefined;
  if (!signalR) {
    throw new Error("SignalR client library is not available.");
  }

  return new signalR.HubConnectionBuilder()
    .withUrl(`${getApiBaseUrl()}/hubs/clipboard`, {
      accessTokenFactory: () => token
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
};
