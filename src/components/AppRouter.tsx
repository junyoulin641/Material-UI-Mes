import * as React from 'react';
import { useState, createContext, useContext } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Drawer as MuiDrawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Avatar, Stack, Divider } from '@mui/material';
import { drawerClasses } from '@mui/material/Drawer';
import {
  DashboardRounded as DashboardIcon,
  TableViewRounded as TableIcon,
  SearchRounded as LogIcon,
  FolderOpenRounded as MTCCTIcon,
  Psychology as AIIcon,
  SettingsRounded as SettingsIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  HelpOutlineRounded as HelpIcon,
} from '@mui/icons-material';

// 引入所有頁面組件
import CompleteMesDashboard from './CompleteMesDashboard';
import EnhancedTableView from './EnhancedTableView';
import EnhancedLogQuery from './EnhancedLogQuery';
import MTCCTManagement from './MTCCTManagement';
import AIAnalysisSystem from './AIAnalysisSystem';
import SystemSettings from './SystemSettings';
import UserPreferences from './UserPreferences';

export type ViewType = 'dashboard' | 'table' | 'logs' | 'mtcct' | 'ai' | 'settings';

interface NavigationContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

interface NavigationItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

const mainListItems = [
  { id: 'dashboard', label: '儀表板', icon: <DashboardIcon /> },
  { id: 'table', label: '測試記錄', icon: <TableIcon /> },
  { id: 'logs', label: 'LOG 查詢', icon: <LogIcon /> },
  { id: 'mtcct', label: 'MTCCT 管理', icon: <MTCCTIcon /> },
  { id: 'ai', label: 'AI 分析', icon: <AIIcon /> },
];

const secondaryListItems = [
  { id: 'settings', label: '系統設定', icon: <SettingsIcon /> },
  { id: 'help', label: '幫助與支援', icon: <HelpIcon /> },
];

interface AppRouterProps {
  children?: React.ReactNode;
}

export function AppRouter({ children }: AppRouterProps) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <CompleteMesDashboard />;
      case 'table':
        return <EnhancedTableView />;
      case 'logs':
        return <EnhancedLogQuery />;
      case 'mtcct':
        return <MTCCTManagement />;
      case 'ai':
        return <AIAnalysisSystem />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <CompleteMesDashboard />;
    }
  };

  const contextValue: NavigationContextType = {
    currentView,
    setCurrentView,
    drawerOpen: true,
    setDrawerOpen: () => {},
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            [`& .${drawerClasses.paper}`]: {
              backgroundColor: 'background.paper',
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 'calc(var(--template-frame-height, 0px) + 4px)',
              p: 2,
              gap: 1.5,
            }}
          >
            <PrecisionManufacturingIcon
              sx={{
                color: 'primary.main',
                fontSize: 28
              }}
            />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: 'primary.main',
                }}
              >
                MES System
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }}
              >
                Manufacturing Execution
              </Typography>
            </Box>
          </Box>
          <Divider />

          {/* Menu Content */}
          <Box
            sx={{
              overflow: 'auto',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
              <Box>
                <List dense>
                  {mainListItems.map((item) => (
                    <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                      <ListItemButton
                        selected={currentView === item.id}
                        onClick={() => handleViewChange(item.id)}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box>
                <Divider sx={{ my: 1 }} />
                <List dense>
                  {secondaryListItems.map((item) => (
                    <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                      <ListItemButton
                        selected={currentView === item.id}
                        onClick={() => handleViewChange(item.id)}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Stack>
          </Box>

          {/* Bottom User Info */}
          <Stack
            direction="row"
            sx={{
              p: 2,
              gap: 1,
              alignItems: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Avatar
              sizes="small"
              alt="System User"
              sx={{ width: 36, height: 36 }}
            >
              SU
            </Avatar>
            <Box sx={{ mr: 'auto' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                系統用戶
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                system@mes.local
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setPreferencesOpen(true)}
              sx={{ ml: 1 }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: 'background.default',
            overflow: 'auto',
          }}
        >
          {renderCurrentView()}
          {children}
        </Box>

        {/* 個人偏好設定對話框 */}
        <UserPreferences
          open={preferencesOpen}
          onClose={() => setPreferencesOpen(false)}
        />
      </Box>
    </NavigationContext.Provider>
  );
}

export default AppRouter;