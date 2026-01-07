import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import { ReactNode, useState } from "react";
import { ThemeMode } from "../theme/theme";

export interface AppUser {
  name?: string | null;
  email?: string | null;
  pictureUrl?: string | null;
}

interface AppShellProps {
  children: ReactNode;
  themeMode: ThemeMode;
  user?: AppUser | null;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const drawerWidth = 240;

export const AppShell = ({
  children,
  themeMode,
  user,
  onToggleTheme,
  onLogout
}: AppShellProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);

  const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  const handleUserOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchor(event.currentTarget);
  };

  const handleUserClose = () => {
    setUserAnchor(null);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            MarinApp
          </Typography>
          <Tooltip title="Settings">
            <IconButton color="inherit" onClick={handleSettingsOpen}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={settingsAnchor}
            open={Boolean(settingsAnchor)}
            onClose={handleSettingsClose}
          >
            <MenuItem
              onClick={() => {
                onToggleTheme();
                handleSettingsClose();
              }}
            >
              Toggle to {themeMode === "dark" ? "light" : "dark"} theme
            </MenuItem>
            <MenuItem disabled>More settings (coming soon)</MenuItem>
          </Menu>
          <Tooltip title={user?.email ?? "Account"}>
            <IconButton color="inherit" onClick={handleUserOpen} sx={{ ml: 1 }}>
              <Avatar
                src={user?.pictureUrl ?? undefined}
                alt={user?.name ?? "User"}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={userAnchor}
            open={Boolean(userAnchor)}
            onClose={handleUserClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1">{user?.name ?? "Guest"}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email ?? "Not signed in"}
              </Typography>
            </Box>
            <Divider />
            <MenuItem disabled>Manage Account</MenuItem>
            <MenuItem
              onClick={() => {
                handleUserClose();
                onLogout();
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItem>
              <ListItemText primary="Dashboard" secondary="Coming soon" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Projects" secondary="Coming soon" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};
