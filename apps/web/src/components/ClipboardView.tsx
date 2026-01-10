import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  Divider,
  Fab,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import { ClipboardItem } from "../services/clipboardService";

interface ClipboardViewProps {
  items: ClipboardItem[];
  loading: boolean;
  error: string | null;
  textTitle: string;
  textMarkdown: string;
  fileTitle: string;
  onTextTitleChange: (value: string) => void;
  onTextMarkdownChange: (value: string) => void;
  onFileTitleChange: (value: string) => void;
  onSaveText: () => void;
  onPasteFromClipboard: () => void;
  onFileSelected: (file: File | null) => void;
  onDeleteItem: (itemId: string) => void;
}

export const ClipboardView = ({
  items,
  loading,
  error,
  textTitle,
  textMarkdown,
  fileTitle,
  onTextTitleChange,
  onTextMarkdownChange,
  onFileTitleChange,
  onSaveText,
  onPasteFromClipboard,
  onFileSelected,
  onDeleteItem
}: ClipboardViewProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleCopyToClipboard = async (text?: string | null) => {
    if (!text) {
      return;
    }

    if (!navigator.clipboard?.writeText) {
      return;
    }

    await navigator.clipboard.writeText(text);
  };

  const handleDownload = (item: ClipboardItem) => {
    if (!item.previewUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = item.previewUrl;
    if (item.fileName) {
      link.download = item.fileName;
    }
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isMediaItem = (item: ClipboardItem) =>
    item.itemType !== "text" &&
    (item.contentType?.startsWith("image/") || item.contentType?.startsWith("video/"));

  const isImageItem = (item: ClipboardItem) => item.contentType?.startsWith("image/");
  const isVideoItem = (item: ClipboardItem) => item.contentType?.startsWith("video/");

  const mediaItems = items.filter((item) => isMediaItem(item));
  const fileItems = items.filter(
    (item) => item.itemType !== "text" && !isMediaItem(item)
  );
  const textItems = items.filter((item) => item.itemType === "text");

  const renderItemTypeIcon = (item: ClipboardItem) => {
    if (item.itemType === "text") {
      return (
        <Tooltip title="Text">
          <TextSnippetIcon fontSize="small" color="action" />
        </Tooltip>
      );
    }

    if (isImageItem(item)) {
      return (
        <Tooltip title="Image">
          <ImageIcon fontSize="small" color="action" />
        </Tooltip>
      );
    }

    if (isVideoItem(item)) {
      return (
        <Tooltip title="Video">
          <VideocamIcon fontSize="small" color="action" />
        </Tooltip>
      );
    }

    return (
      <Tooltip title="File">
        <DescriptionIcon fontSize="small" color="action" />
      </Tooltip>
    );
  };

  const renderItemCard = (item: ClipboardItem) => (
    <Grid item xs={12} sm={6} md={4} key={item.id}>
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                {renderItemTypeIcon(item)}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                {item.itemType === "text" ? (
                  <Tooltip title="Copy to clipboard">
                    <span>
                      <IconButton
                        aria-label="Copy to clipboard"
                        onClick={() => void handleCopyToClipboard(item.markdownContent)}
                        disabled={loading}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title="Download">
                    <span>
                      <IconButton
                        aria-label="Download"
                        onClick={() => handleDownload(item)}
                        disabled={loading || !item.previewUrl}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                <Tooltip title="Delete">
                  <span>
                    <IconButton
                      aria-label="Delete"
                      onClick={() => onDeleteItem(item.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {item.title || item.fileName || "Clipboard item"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(item.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
        <Divider />
        <CardContent>
          <Stack spacing={1}>
            {item.itemType === "text" && (
              <Typography variant="body2" color="text.secondary">
                {item.markdownContent?.slice(0, 140) || "Markdown content"}
              </Typography>
            )}
            {item.itemType !== "text" && (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  {item.fileName}
                </Typography>
                {item.contentType?.startsWith("image/") && item.previewUrl && (
                  <Box
                    component="img"
                    src={item.previewUrl}
                    alt={item.fileName ?? "Clipboard image"}
                    sx={{ width: "100%", borderRadius: 1, objectFit: "cover" }}
                  />
                )}
                {item.fileSizeBytes && (
                  <Typography variant="caption" color="text.secondary">
                    {(item.fileSizeBytes / 1024).toFixed(1)} KB
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="flex-start">
        <Fab
          color="primary"
          aria-label="Add to clipboard"
          onClick={() => setIsAddOpen((previous) => !previous)}
        >
          <AddIcon />
        </Fab>
      </Stack>

      <Collapse in={isAddOpen} unmountOnExit>
        <Card>
          <CardHeader title="Add to clipboard" subheader="Markdown text, images, and files." />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Title (optional)"
                value={textTitle}
                onChange={(event) => onTextTitleChange(event.target.value)}
                fullWidth
              />
              <TextField
                label="Markdown text"
                value={textMarkdown}
                onChange={(event) => onTextMarkdownChange(event.target.value)}
                multiline
                minRows={4}
                fullWidth
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  onClick={onSaveText}
                  disabled={loading || !textMarkdown.trim()}
                >
                  Save text
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={onPasteFromClipboard}
                >
                  Paste from device
                </Button>
              </Stack>
            </Stack>
          </CardContent>
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="File title (optional)"
                value={fileTitle}
                onChange={(event) => onFileTitleChange(event.target.value)}
                fullWidth
              />
              <Button variant="outlined" component="label">
                Upload file or image
                <input
                  type="file"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    event.target.value = "";
                    onFileSelected(file);
                  }}
                />
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Collapse>

      <Card>
        <CardHeader title="Your clipboard" subheader="Newest items appear first." />
        <CardContent>
          {error && <Alert severity="error">{error}</Alert>}
          {loading && (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress />
            </Box>
          )}
          {!loading && items.length === 0 && <Alert severity="info">No clipboard items yet.</Alert>}
          {!loading && items.length > 0 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Media
                </Typography>
                {mediaItems.length === 0 ? (
                  <Alert severity="info">No media items yet.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {mediaItems.map((item) => renderItemCard(item))}
                  </Grid>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Files
                </Typography>
                {fileItems.length === 0 ? (
                  <Alert severity="info">No files yet.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {fileItems.map((item) => renderItemCard(item))}
                  </Grid>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Text
                </Typography>
                {textItems.length === 0 ? (
                  <Alert severity="info">No text items yet.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {textItems.map((item) => renderItemCard(item))}
                  </Grid>
                )}
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};
