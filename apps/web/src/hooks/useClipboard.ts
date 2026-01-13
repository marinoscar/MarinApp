import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../services/apiClient";
import { createClipboardHubConnection } from "../services/clipboardHub";
import { clipboardService, ClipboardItem } from "../services/clipboardService";

type ClipboardHubStatus = "idle" | "connecting" | "connected" | "disconnected";

interface ClipboardState {
  items: ClipboardItem[];
  loading: boolean;
  error: string | null;
  hubStatus: ClipboardHubStatus;
  textTitle: string;
  textMarkdown: string;
  fileUploadTitle: string;
  setTextTitle: (value: string) => void;
  setTextMarkdown: (value: string) => void;
  setFileUploadTitle: (value: string) => void;
  handleSaveText: () => Promise<void>;
  handlePasteFromClipboard: () => Promise<void>;
  handlePasteClipboardItem: () => Promise<void>;
  handlePasteText: (text: string) => Promise<void>;
  handleFileUpload: (files: File[]) => Promise<void>;
  handleDeleteItem: (itemId: string) => Promise<void>;
  handleRefresh: () => Promise<void>;
}

export const useClipboard = (
  token: string | null,
  isActive: boolean,
  onUnauthorized?: () => void
): ClipboardState => {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hubStatus, setHubStatus] = useState<ClipboardHubStatus>("idle");
  const [textTitle, setTextTitle] = useState("");
  const [textMarkdown, setTextMarkdown] = useState("");
  const [fileUploadTitle, setFileUploadTitle] = useState("");
  const clipboardHubRef = useRef<ReturnType<typeof createClipboardHubConnection> | null>(null);

  const handleUnauthorized = useCallback(
    (err: unknown): boolean => {
      if (err instanceof ApiError && err.status === 401) {
        setError(null);
        onUnauthorized?.();
        return true;
      }
      return false;
    },
    [onUnauthorized]
  );

  const loadClipboard = useCallback(
    async (accessToken: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await clipboardService.list(accessToken);
        setItems(data.items);
      } catch (err) {
        if (handleUnauthorized(err)) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load clipboard");
      } finally {
        setLoading(false);
      }
    },
    [handleUnauthorized]
  );

  useEffect(() => {
    if (token) {
      void loadClipboard(token);
    } else {
      setItems([]);
    }
  }, [token, loadClipboard]);

  useEffect(() => {
    if (!token || !isActive) {
      setHubStatus("idle");
      if (clipboardHubRef.current) {
        void clipboardHubRef.current.stop();
        clipboardHubRef.current = null;
      }
      return;
    }

    let isCancelled = false;
    let connection: ReturnType<typeof createClipboardHubConnection>;
    try {
      connection = createClipboardHubConnection(token);
    } catch {
      if (!isCancelled) {
        setHubStatus("disconnected");
      }
      return;
    }
    clipboardHubRef.current = connection;
    setHubStatus("connecting");

    const handleClipboardUpdated = () => {
      void loadClipboard(token);
    };

    connection.on("ClipboardUpdated", handleClipboardUpdated);
    connection.onreconnecting(() => {
      if (!isCancelled) {
        setHubStatus("disconnected");
      }
    });
    connection.onreconnected(() => {
      if (!isCancelled) {
        setHubStatus("connected");
      }
    });
    connection.onclose(() => {
      if (!isCancelled) {
        setHubStatus("disconnected");
      }
    });

    connection
      .start()
      .then(() => {
        if (!isCancelled) {
          setHubStatus("connected");
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setHubStatus("disconnected");
        }
      });

    return () => {
      isCancelled = true;
      connection.off("ClipboardUpdated", handleClipboardUpdated);
      void connection.stop();
    };
  }, [isActive, loadClipboard, token]);

  const handleSaveText = useCallback(async () => {
    if (!token || !textMarkdown.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await clipboardService.createText(token, {
        title: textTitle.trim() || undefined,
        markdownContent: textMarkdown
      });
      setTextTitle("");
      setTextMarkdown("");
      await loadClipboard(token);
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to save text");
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized, loadClipboard, textMarkdown, textTitle, token]);

  const handlePasteFromClipboard = useCallback(async () => {
    if (!navigator.clipboard?.readText) {
      setError("Clipboard access is not available in this browser.");
      return;
    }

    try {
      const clipText = await navigator.clipboard.readText();
      setTextMarkdown((current) => `${current}${current ? "\n" : ""}${clipText}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read clipboard");
    }
  }, []);

  const handlePasteClipboardItem = useCallback(async () => {
    if (!token) {
      return;
    }

    if (!navigator.clipboard?.read) {
      setError("Clipboard read access is not available in this browser.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const clipboardItems = await navigator.clipboard.read();
      let didHandle = false;

      for (const clipboardItem of clipboardItems) {
        if (clipboardItem.types.includes("text/plain")) {
          const textBlob = await clipboardItem.getType("text/plain");
          const clipboardText = await textBlob.text();
          if (clipboardText.trim()) {
            await clipboardService.createText(token, {
              title: textTitle.trim() || undefined,
              markdownContent: clipboardText
            });
            didHandle = true;
          }
        }

        for (const type of clipboardItem.types) {
          if (type.startsWith("text/")) {
            continue;
          }

          const blob = await clipboardItem.getType(type);
          const extension = type.split("/")[1] ?? "bin";
          const file = new File([blob], `clipboard-${Date.now()}.${extension}`, { type });
          await clipboardService.uploadFile(token, file, fileUploadTitle.trim() || undefined);
          didHandle = true;
        }
      }

      if (didHandle) {
        await loadClipboard(token);
      } else {
        setError("Clipboard does not contain supported data.");
      }
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to read clipboard");
    } finally {
      setLoading(false);
    }
  }, [fileUploadTitle, handleUnauthorized, loadClipboard, textTitle, token]);

  const handlePasteText = useCallback(
    async (text: string) => {
      if (!token || !text.trim()) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        await clipboardService.createText(token, {
          title: textTitle.trim() || undefined,
          markdownContent: text
        });
        await loadClipboard(token);
      } catch (err) {
        if (handleUnauthorized(err)) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to save text");
      } finally {
        setLoading(false);
      }
    },
    [handleUnauthorized, loadClipboard, textTitle, token]
  );

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (!token || files.length === 0) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        for (const file of files) {
          await clipboardService.uploadFile(token, file, fileUploadTitle.trim() || undefined);
        }
        setFileUploadTitle("");
        await loadClipboard(token);
      } catch (err) {
        if (handleUnauthorized(err)) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to upload file");
      } finally {
        setLoading(false);
      }
    },
    [fileUploadTitle, handleUnauthorized, loadClipboard, token]
  );

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      if (!token) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        await clipboardService.deleteItem(token, itemId);
        await loadClipboard(token);
      } catch (err) {
        if (handleUnauthorized(err)) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to delete item");
      } finally {
        setLoading(false);
      }
    },
    [handleUnauthorized, loadClipboard, token]
  );

  const handleRefresh = useCallback(async () => {
    if (!token) {
      return;
    }

    await loadClipboard(token);
  }, [loadClipboard, token]);

  return {
    items,
    loading,
    error,
    hubStatus,
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
    handleDeleteItem,
    handleRefresh
  };
};
