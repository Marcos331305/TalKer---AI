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

  const handleDeleteChats = () => {
    // Handle delete chats functionality here
    console.log('Delete all chats');
  };

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