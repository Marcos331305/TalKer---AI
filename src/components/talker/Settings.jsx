import React, { useContext, useState } from 'react';
import { Box, Divider, Backdrop, IconButton, Select, MenuItem, FormControl, InputLabel, Button, Typography, Popover, ListItemText, ListItemIcon } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ArrowDropDown, Check, CheckCircle } from '@mui/icons-material';
import { ThemeContext } from '../../main';
import { getAuth, signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { setAuthState } from '../../features/authSlice';
import { clearActiveConversationId } from '../../features/conversationsSlice';
import { useNavigate } from 'react-router-dom';

const Settings = ({ settingsOpened, setSettingsOpened }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [clicked, setClicked] = useState(false);
  const { isLightMode, setIsLightMode } = useContext(ThemeContext);
  const [themeAnchorEl, setThemeAnchorEl] = useState(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('English');

  const handleLanguageChange = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    closeLanguagePopover();
  };
  const handleDeleteChats = () => {
    // Handle delete chats functionality here
    console.log('Delete all chats');
  };

  const handleThemeChange = (selectedTheme) => {
    selectedTheme === 'light' ? setIsLightMode(true) : setIsLightMode(false);
    setTheme(selectedTheme);
    closeThemePopover();
  };
  // Open/Close Popover Handlers
  const openThemePopover = (event) => setThemeAnchorEl(event.currentTarget);
  const closeThemePopover = () => setThemeAnchorEl(null);
  const openLanguagePopover = (event) => setLanguageAnchorEl(event.currentTarget);
  const closeLanguagePopover = () => setLanguageAnchorEl(null);

  // handle logOut
  const handleLogOut = () => {
    setClicked(true);
    const auth = getAuth();
    // firebase logOut functionality
    setTimeout(async () => {
      await signOut(auth);
      dispatch(setAuthState()); // set the userAuthenticated state to false first that have using in authSlice
      dispatch(clearActiveConversationId());
      navigate('/'); // Redirect the user to Home-Page(loginPage)
    }, 1000); // Duration of the logOut process
  };

  return (
    <>
      {/* Backdrop */}
      {settingsOpened && (
        <Backdrop
          open={settingsOpened}
          sx={{
            zIndex: 9999, // Ensure the backdrop is behind the settings dialog but above other UI elements
            bgcolor: 'rgba(5, 5, 5, 0.7)', // Semi-transparent black background
          }}
        />
      )}


      {/* Settings Dialog */}
      {
        settingsOpened && (
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#2F2F2F',
              padding: 2,
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
              zIndex: 10000,
            }}
          >
            {/* Header with Close Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                Settings
              </Typography>
              <IconButton onClick={() => setSettingsOpened(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Divider */}
            <Divider sx={{ my: 2, backgroundColor: '#444444' }} />

            {/* Settings List */}
            <Box>
              {/* Language Setting */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: '#FFFFFF' }}>Language</Typography>
                {/* Button to trigger the popover */}
                <Button
                  onClick={openLanguagePopover}
                  sx={{
                    backgroundColor: '#444444',
                    color: '#FFFFFF',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#555555',
                    },
                  }}
                  endIcon={<ArrowDropDown />}
                >
                  <Typography>{language.charAt(0).toUpperCase() + language.slice(1)}</Typography>
                </Button>
                {/* languagePopover */}
                <Popover
                  open={Boolean(languageAnchorEl)}
                  anchorEl={languageAnchorEl}
                  onClose={closeLanguagePopover}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  sx={{
                    zIndex: 11000,
                    '& .MuiPaper-root': {
                      borderRadius: '16px',
                      border: '1.2px solid #5D5D5D'
                    },
                  }}
                  transitionDuration={{
                    appear: 0, // No delay for appearing
                    enter: 0,  // No delay for entering (showing)
                    exit: 1000, // Add a delay (200ms) for closing
                  }}
                >
                  <Box sx={{ backgroundColor: '#444444', color: '#FFFFFF', minWidth: 125 }}>
                    <MenuItem
                      onClick={() => handleLanguageChange('English')}
                      sx={{
                        color: '#FFFFFF',
                        '&:hover': {
                          backgroundColor: '#555555',
                        },
                      }}
                    >
                      <ListItemText
                        primary="English"
                        primaryTypographyProps={{
                          sx: {
                            fontSize: '14px',
                          },
                        }}
                      />

                      {language === 'English' && (
                        <ListItemIcon sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}>
                          <CheckCircle sx={{ color: '#FFFFFF', fontSize: '14px' }} />
                        </ListItemIcon>
                      )}
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleLanguageChange('Hindi')}
                      sx={{
                        color: '#FFFFFF',
                        '&:hover': {
                          backgroundColor: '#555555',
                        },
                      }}
                    >
                      <ListItemText
                        primary="Hindi"
                        primaryTypographyProps={{
                          sx: {
                            fontSize: '14px',
                          },
                        }}
                      />

                      {language === 'Hindi' && (
                        <ListItemIcon sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}>
                          <CheckCircle sx={{ color: '#FFFFFF', fontSize: '14px' }} />
                        </ListItemIcon>
                      )}
                    </MenuItem>
                  </Box>
                </Popover>
              </Box>
              <Divider sx={{ my: 1, backgroundColor: '#444444' }} />

              {/* Delete All Chats */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: '#FFFFFF' }}>Delete All Chats</Typography>
                <Button
                  variant="contained"
                  onClick={handleDeleteChats}
                  sx={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    borderRadius: '50px',
                    '&:hover': {
                      backgroundColor: '#D83F3F',
                    },
                  }}
                >
                  Delete All
                </Button>
              </Box>
              <Divider sx={{ my: 1, backgroundColor: '#444444' }} />

              {/* Logout */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: '#FFFFFF' }}>Logout on this Device</Typography>
                <Button
                  variant="outlined"
                  onClick={handleLogOut}
                  sx={{
                    backgroundColor: '#2F2F2F',
                    color: '#FFFFFF',
                    borderRadius: '50px',
                    border: '1px solid #444444',
                    '&:hover': {
                      backgroundColor: '#444444',
                    },
                  }}
                >
                  {clicked ? "Logging out..." : "Logout"}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
    </>
  );
};

export default Settings;