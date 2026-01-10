import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Fab,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
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
            <Grid container spacing={2}>
              {items.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardHeader
                      title={item.title || item.fileName || "Clipboard item"}
                      subheader={new Date(item.createdAt).toLocaleString()}
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <Stack spacing={1}>
                        <Chip size="small" label={item.itemType === "text" ? "Text" : "File"} />
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
                    <CardActions sx={{ justifyContent: "flex-end" }}>
                      <IconButton
                        aria-label="Delete"
                        onClick={() => onDeleteItem(item.id)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};
