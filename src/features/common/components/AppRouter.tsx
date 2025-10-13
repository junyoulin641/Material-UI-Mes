import * as React from 'react';
import { useState, createContext, useContext } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Drawer as MuiDrawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Avatar, Stack, Divider, Card, CardContent, Button, Grid, Breadcrumbs } from '@mui/material';
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
  HomeRounded as HomeIcon,
  Replay as RetestIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';

// 引入所有頁面組件
import DashboardView from '../../dashboard/components/DashboardView';
import TableView from '../../table/components/TableView';
import LogQueryView from '../../logs/components/LogQueryView';
import MTCCTView from '../../mtcct/components/MTCCTView';
import AIAnalysisView from '../../ai-analysis/components/AIAnalysisView';
import SettingsView from '../../settings/components/SettingsView';
import UserPreferences from '../../settings/components/UserPreferences';
import RetestListView from '../../retest/components/RetestListView';
import LoginPage from '../../auth/components/LoginPage';
import { useAuth } from '../../auth/contexts/AuthContext';

export type ViewType = 'dashboard' | 'table' | 'logs' | 'mtcct' | 'ai' | 'retest' | 'settings' | 'help';

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

interface AppRouterProps {
  children?: React.ReactNode;
}

export function AppRouter({ children }: AppRouterProps) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated, user, login, logout } = useAuth();

  // 如果未登入，顯示登入預覽頁面（可切換設計）
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  const mainListItems = [
    { id: 'dashboard' as ViewType, label: t('dashboard'), icon: <DashboardIcon /> },
    { id: 'table' as ViewType, label: t('test.records'), icon: <TableIcon /> },
    { id: 'retest' as ViewType, label: t('retest.details'), icon: <RetestIcon /> },
    { id: 'logs' as ViewType, label: t('log.query'), icon: <LogIcon /> },
    { id: 'mtcct' as ViewType, label: t('mtcct.management'), icon: <MTCCTIcon /> },
    { id: 'ai' as ViewType, label: t('ai.analysis'), icon: <AIIcon /> },
  ];

  const secondaryListItems = [
    { id: 'settings' as ViewType, label: t('settings'), icon: <SettingsIcon /> },
    { id: 'help' as ViewType, label: t('help.support'), icon: <HelpIcon /> },
  ];

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'table':
        return <TableView />;
      case 'retest':
        return <RetestListView />;
      case 'logs':
        return <LogQueryView />;
      case 'mtcct':
        return <MTCCTView />;
      case 'ai':
        return <AIAnalysisView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return (
          <Box sx={{ p: 3, pl: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HomeIcon fontSize="small" />
                  <Typography variant="body2">{t('home')}</Typography>
                </Box>
                <Typography variant="body2" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HelpIcon fontSize="small" />
                  {t('help.support')}
                </Typography>
              </Breadcrumbs>
              <Typography variant="h4" gutterBottom>
                {t('help.support')}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📖 {t('user.manual')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {t('user.manual.description')}
                    </Typography>
                    <Button variant="outlined" size="small">
                      {t('download.pdf')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🎥 {t('tutorial.videos')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {t('tutorial.videos.description')}
                    </Typography>
                    <Button variant="outlined" size="small">
                      {t('watch.videos')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📞 {t('technical.support')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {t('technical.support.description')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {t('phone')}: (02) 2345-6789
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {t('email')}: support@mes.com
                    </Typography>
                    <Button variant="outlined" size="small">
                      {t('send.message')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ❓ {t('faq')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {t('faq.description')}
                    </Typography>
                    <Button variant="outlined" size="small">
                      {t('browse.faq')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return <DashboardView />;
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
              alt={user?.displayName || 'User'}
              sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
            >
              {user?.displayName.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ mr: 'auto' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                {user?.displayName || t('system.user')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.role === 'admin' ? t('role.admin') : t('role.user')}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setPreferencesOpen(true)}
              sx={{ ml: 1 }}
              title={t('user.preferences')}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={logout}
              sx={{ ml: 0.5 }}
              title={t('logout')}
            >
              <LogoutIcon fontSize="small" />
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