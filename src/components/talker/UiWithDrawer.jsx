import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChatArea from './ChatArea';
import MsgInput from './MsgInput';
import SideBarForDrawer from './SideBarForDrawer';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { clearActiveConversationId, fetchConversations, setActiveIndex } from "../../features/conversationsSlice.js";
import { clearMessages } from "../../features/messageSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Divider, List, ListItem, ListItemText, Popover } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { setAuthState } from "../../features/authSlice.js";
import PersonIcon from '@mui/icons-material/Person';
import MemoryIcon from '@mui/icons-material/Memory';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import Button from '@mui/material/Button';
import ShareIcon from '@mui/icons-material/Share';
import ShareDialog from './navbar/ShareDialog.jsx';

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

export default function UiWithDrawer({ isNavigating, setIsNavigating, showScrollButton, setShowScrollButton, messageInputRef, chatContainerRef }) {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = React.useState(true);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [clicked, setClicked] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false); // for shareOption
    const activeConversationId = useSelector((state) => state.conversations.activeConversationId);

    // useEffect for getting the userDetails when the component Mount's
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // current user Conversations on the appLoad
                dispatch(fetchConversations(user.uid));
                // User is signed in
                setUser(user);
            } else {
                // User is signed out
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe(); // Clean up subscription on unmount
    }, []);

    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };

    // Functionality goes here
    const handleNewConversation = () => {
        if (activeConversationId !== null) {
            dispatch(setActiveIndex(null));
            dispatch(clearActiveConversationId());
            dispatch(clearMessages()); // Clear previous messages
            setShowScrollButton(false);
            navigate('/talker');
        }
    };
    const isOpen = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleLogOut = () => {
        setClicked(true);
        const auth = getAuth();
        // firebase logOut functionality
        setTimeout(async () => {
            await signOut(auth);
            dispatch(setAuthState()); // set the userAuthenticated state to false first that have using in authSlice
            dispatch(clearActiveConversationId());
            dispatch(clearMessages());
            navigate('/'); // Redirect the user to Home-Page(loginPage)
        }, 1000); // Duration of the logOut process
    };
    const handleOpenShareDialog = () => {
        setShareDialogOpen(true);
    };

    const handleCloseShareDialog = () => {
        setShareDialogOpen(false);
    };

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
                        {/* Left Side: Plus Icon + TalKerAI */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={handleDrawerOpen}
                                edge="start"
                                sx={[
                                    open && { display: 'none' },
                                ]}
                            >
                                <MenuIcon color="primary" />
                            </IconButton>
                            {!open && (
                                <IconButton onClick={handleNewConversation}>
                                    <AddCircleIcon
                                        color="primary"
                                    />
                                </IconButton>
                            )}
                            <Typography
                                variant="h6"
                                noWrap
                                component="div"
                                color="#B4B4B4"
                                sx={{
                                    fontSize: '18px',
                                    marginInline: open ? '0px' : '12px',
                                }}
                            >
                                TalKerAI
                            </Typography>
                        </Box>

                        {/* Right Side: shareBtn & userAvatar */}
                        <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                            {/* shareBtn */}
                            <Box>
                                <Button onClick={handleOpenShareDialog}
                                    variant="outlined"
                                    sx={{
                                        px: '14px',
                                        py: '8px',
                                        fontSize: '14px',
                                        textTransform: 'none', // To avoid uppercase text
                                        borderRadius: '50px', // Fully rounded border
                                        border: '1px solid #424242',
                                        color: '#FFFFFF', // Default text color
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px', // Gap between icon and text
                                        '&:hover': {
                                            backgroundColor: '#2F2F2F', // Hover background color
                                            borderColor: '#424242', // Optional: Maintain border color on hover
                                        },
                                    }}
                                >
                                    <ShareIcon sx={{ fontSize: '16px' }} />
                                    Share
                                </Button>
                            </Box>
                            {/* userAvatar */}
                            <Box
                                onClick={handleClick}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginTop: 'auto',
                                    backgroundColor: open ? '#212121' : 'transparent',
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: 40,
                                        height: 40,
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress
                                            size={40} // Matches the Avatar size
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                            }}
                                        />
                                    ) : (
                                        <Avatar
                                            alt="User Avatar"
                                            src={user?.photoURL}
                                            onClick={handleClick}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                transition: '0.3s', // Smooth transition of styles
                                                '&:hover': {
                                                    border: '1px solid white', // Thin light border on hover
                                                },
                                                cursor: 'pointer',
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null; // Prevent infinite fallback loop
                                                e.target.src = ''; // Clear broken image URL to force fallback
                                            }}
                                        >
                                            <AccountCircle
                                                sx={{
                                                    fontSize: 40, // Match the Avatar size
                                                    color: '#757575', // Default grey color for the icon
                                                }}
                                            />
                                        </Avatar>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>
                {/* shareDialog */}
                <ShareDialog open={shareDialogOpen} handleClose={handleCloseShareDialog} />
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
                        setIsNavigating={setIsNavigating}
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
                        isNavigating={isNavigating}
                        setIsNavigating={setIsNavigating}
                    />
                </Main>

                {/* menuOfUserAccount */}
                <Popover
                    open={isOpen}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    PaperProps={{
                        sx: {
                            mt: '5px', // Add spacing between Popover and Avatar
                        },
                    }}
                    sx={{
                        '& .MuiPaper-root': {
                            borderRadius: '14px',
                            border: '1px solid #5D5D5D',
                        },
                    }}
                >
                    <List sx={{ width: 240, bgcolor: '#2F2F2F', padding: '8px', boxSizing: 'border-box' }}>
                        {/* Email at the top */}
                        <ListItem sx={{
                            py: '12px',
                        }}>
                            <Typography variant="body2" sx={{ color: '#E3E3E3', px: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{(user) && user.email}</Typography>
                        </ListItem>
                        <Divider sx={{ bgcolor: '#5D5D5D', height: '1px' }} />

                        {/* Mid Part */}
                        {/* Your Data */}
                        <ListItem button sx={{
                            px: '16px',
                            pt: '8px',
                            pb: '4px',
                            mt: '3px',
                            cursor: 'pointer',
                            borderRadius: '9px',
                            ":hover": {
                                bgcolor: '#424242',
                            }
                        }}>
                            <PersonIcon sx={{ color: '#E3E3E3', marginRight: 1, fontSize: '18px' }} />
                            <ListItemText primary={<Typography sx={{ color: '#E3E3E3', fontSize: '14px' }}>Your Data</Typography>} sx={{ color: '#E3E3E3', fontSize: '14px !important' }} />
                        </ListItem>
                        {/* Memory */}
                        <ListItem button sx={{
                            px: '16px',
                            pt: '4px',
                            pb: '4px',
                            cursor: 'pointer',
                            borderRadius: '9px',
                            ":hover": {
                                bgcolor: '#424242'
                            }
                        }}>
                            <MemoryIcon sx={{ color: '#E3E3E3', marginRight: 1, fontSize: '18px' }} />
                            <ListItemText primary={<Typography sx={{ color: '#E3E3E3', fontSize: '14px' }}>Memory</Typography>} sx={{ color: '#E3E3E3', fontSize: '14px !important' }} />
                        </ListItem>
                        {/* Security */}
                        <ListItem button sx={{
                            px: '16px',
                            pt: '4px',
                            pb: '4px',
                            cursor: 'pointer',
                            borderRadius: '9px',
                            ":hover": {
                                bgcolor: '#424242'
                            }
                        }}>
                            <SecurityIcon sx={{ color: '#E3E3E3', marginRight: 1, fontSize: '18px' }} />
                            <ListItemText primary={<Typography sx={{ color: '#E3E3E3', fontSize: '14px' }}>Security</Typography>} sx={{ color: '#E3E3E3', fontSize: '14px !important' }} />
                        </ListItem>
                        {/* Settings */}
                        <ListItem button sx={{
                            pt: '4px',
                            pb: '8px',
                            cursor: 'pointer',
                            borderRadius: '9px',
                            mb: '3px',
                            ":hover": {
                                bgcolor: '#424242',
                            }
                        }}>
                            <SettingsIcon sx={{ color: '#E3E3E3', marginRight: 1, fontSize: '18px' }} />
                            <ListItemText primary={<Typography sx={{ color: '#E3E3E3', fontSize: '14px' }}>Settings</Typography>} sx={{ color: '#E3E3E3', fontSize: '14px !important' }} />
                        </ListItem>
                        <Divider sx={{ bgcolor: '#5D5D5D', height: '1px' }} />
                        {/* FeedBack */}
                        <ListItem button sx={{
                            cursor: 'pointer',
                            borderRadius: '9px',
                            ":hover": {
                                bgcolor: '#424242'
                            },
                            my: '3px'
                        }}>
                            <FeedbackIcon sx={{ color: '#E3E3E3', marginRight: 1, fontSize: '18px' }} />
                            <ListItemText primary={<Typography sx={{ color: '#E3E3E3', fontSize: '14px' }}>FeedBack</Typography>} sx={{ color: '#E3E3E3', fontSize: '14px !important' }} />
                        </ListItem>
                        <Divider sx={{ bgcolor: '#5D5D5D', height: '1px' }} />

                        {/* Logout option */}
                        <ListItem sx={{
                            transform: clicked ? 'scale(0.95)' : 'scale(1)',
                            transition: 'transform 0.1s ease',
                            mt: '3px',
                            '&:hover': {
                                backgroundColor: '#424242',
                            },
                            cursor: 'pointer',
                            borderRadius: '9px'
                        }}
                            button onClick={handleLogOut}>
                            <LogoutIcon sx={{ color: '#E3E3E3', marginRight: 1, fontSize: '18px' }} />
                            <ListItemText primary={<Typography sx={{ color: '#E3E3E3', fontSize: '14px' }}>{clicked ? "Logging out..." : "Logout"}</Typography>} sx={{ color: '#E3E3E3', fontSize: '14px !important' }} />
                        </ListItem>
                    </List>
                </Popover>
            </Box>
        </>

    );
}
