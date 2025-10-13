/**
 * Version 5: 極簡優雅版 (Minimalist Elegant)
 * 靈感來自現代設計美學
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Fade,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim()) {
      setError(t('login.error.username.required'));
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError(t('login.error.password.required'));
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const success = onLogin(username, password);
      if (success) {
        // Success
      } else {
        setError(t('login.error.invalid.credentials'));
      }
      setIsLoading(false);
    }, 600);
  };
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#B5C3B2',
        position: 'relative',
        overflow: 'hidden',
        px: 3,
        // 添加微妙的紋理背景
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.02) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Main Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Fade in timeout={800}>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Box
                sx={{
                  display: 'inline-block',
                  width: 70,
                  height: 70,
                  position: 'relative',
                  mb: 3,
                  animation: 'fadeInDown 0.8s ease-out',
                  '@keyframes fadeInDown': {
                    '0%': { opacity: 0, transform: 'translateY(-20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                {/* Enhanced M Logo with glow effect */}
                <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    d="M18 52V18L35 30L52 18V52"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    filter="url(#glow)"
                    opacity="0.95"
                  />
                </svg>
              </Box>

              {/* System Title */}
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  fontWeight: 300,
                  letterSpacing: '3px',
                  fontSize: '1.1rem',
                  opacity: 0.9,
                  animation: 'fadeIn 1s ease-out 0.2s both',
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 0.9 },
                  },
                }}
              >
                MES SYSTEM
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  display: 'block',
                  mt: 0.5,
                  animation: 'fadeIn 1s ease-out 0.4s both',
                }}
              >
                Manufacturing Execution
              </Typography>
            </Box>

            {/* Error Message */}
            {error && (
              <Fade in>
                <Typography
                  sx={{
                    color: '#ff6b6b',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    mb: 3,
                    bgcolor: 'rgba(255,107,107,0.1)',
                    py: 1.5,
                    borderRadius: 1,
                  }}
                >
                  {error}
                </Typography>
              </Fade>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {/* Email Field */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontSize: '0.7rem',
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    autoComplete="username"
                    autoFocus
                    variant="standard"
                    placeholder="admin"
                    sx={{
                      '& .MuiInput-root': {
                        color: 'white',
                        fontSize: '1rem',
                        '&:before': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover:not(.Mui-disabled):before': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&:after': {
                          borderColor: 'white',
                        },
                      },
                      '& input::placeholder': {
                        color: 'rgba(255,255,255,0.5)',
                        opacity: 1,
                      },
                    }}
                  />
                </Box>

                {/* Password Field */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontSize: '0.7rem',
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    variant="standard"
                    placeholder="••••••••••"
                    sx={{
                      '& .MuiInput-root': {
                        color: 'white',
                        fontSize: '1rem',
                        '&:before': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover:not(.Mui-disabled):before': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&:after': {
                          borderColor: 'white',
                        },
                      },
                      '& input::placeholder': {
                        color: 'rgba(255,255,255,0.5)',
                        opacity: 1,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={isLoading}
                            size="small"
                            sx={{
                              color: 'rgba(255,255,255,0.5)',
                              '&:hover': {
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)',
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Login Button */}
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    mt: 3,
                    py: 2,
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    borderRadius: 1,
                    boxShadow: 'none',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)',
                      boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
                      transform: 'translateY(-1px)',
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)',
                      borderColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </Stack>
            </form>

            {/* Decorative Line */}
            <Box
              sx={{
                mt: 5,
                mb: 3,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              }}
            />


            {/* Footer Info */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                © 2025 MES System
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
