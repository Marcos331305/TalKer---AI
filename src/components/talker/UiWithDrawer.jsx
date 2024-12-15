import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from '@mui/material';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  groupConversationsByTime

} from '../../scripts/app';
import ChatArea from './ChatArea';
import SideBar from './navbar/SideBar';
import MsgInput from './MsgInput';
import Login from '../Login';
import SideBarForDrawer from './SideBarForDrawer';

const drawerWidth = 260;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    variants: [
      {
        props: ({ open }) => open,
        style: {
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: 0,
        },
      },
    ],
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function UiWithDrawer({ showScrollButton, setShowScrollButton, messageInputRef, chatContainerRef }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  // SideBar functionality

  return (
    <>
      <Box sx={{ display: 'flex', height: '100vh', width: '100% !important' }}>
        <CssBaseline />
        <AppBar open={open} sx={{
          bgcolor: '#212121',
          boxShadow: 'none',
          position: 'fixed',
          top: 0,
          zIndex: 1100
        }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={[
                {
                  mr: 2,
                },
                open && { display: 'none' },
              ]}
            >
              <MenuIcon color='primary' />
            </IconButton>
            <Typography variant="h6" noWrap component="div" color='#B4B4B4' sx={{
              fontSize: '18px',
            }}>
              TalKerAI
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: '#171717'
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          {/* SideBarForDrawer */}
          <SideBarForDrawer
            handleDrawerClose={handleDrawerClose}
            setShowScrollButton={setShowScrollButton}
          />
        </Drawer>
        <Main sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          mt: '64px',
          p: 0,
          overflow: 'hidden'
        }} open={open}>
          {/* ChatArea */}
          <ChatArea
            chatContainerRef={chatContainerRef}
          />
          {/* MsgInput */}
          <MsgInput
            messageInputRef={messageInputRef}
            chatContainerRef={chatContainerRef}
            showScrollButton={showScrollButton}
            setShowScrollButton={setShowScrollButton}
          />
        </Main>
      </Box>
    </>

  );
}
