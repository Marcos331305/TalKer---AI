import React from 'react'
import {
    List,
    ListItem,
    ListItemText,
    Avatar,
    Box,
    Popover,
    Divider,
    Toolbar,
    IconButton,
    Typography
} from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthState } from '../../features/authSlice';
import { useState, useEffect } from 'react';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { clearActiveConversationId, delConversation, delConversationFromSupabase, fetchConversations, renConversation, setActiveConversationId, setActiveIndex, updateConversationTitle } from '../../features/conversationsSlice';
import { clearMessages, fetchMessages } from '../../features/messageSlice';
import { Share, Edit, Delete } from '@mui/icons-material';
import ShareDialog from './navbar/ShareDialog';
import DeleteDialog from './navbar/DeleteDialog';
import RenameDialog from './navbar/RenameDialog';
import { toast } from 'react-toastify';
import { groupConversationsByTime } from '../../scripts/app';
import ConversationsArea from './navbar/ConversationsArea';

const SideBarForDrawer = ({ setShowScrollButton, handleDrawerClose, setIsNavigating }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [clicked, setClicked] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeConversationTitle, setActiveConversationTitle] = useState('');
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false); // for shareOption
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // for deleteOption
    const [anchorEl, setAnchorEl] = useState(null); // for userMenu
    const [anchorElMore, setAnchorElMore] = useState(null); // for moreIcon
    const activeConversationId = useSelector((state) => state.conversations.activeConversationId);
    // fetch conversationsState from the conversationsSlice to use in sideBars ui
    const { conversations = [] } = useSelector((state) => state.conversations || {});

    useEffect(() => {
        if (Array.isArray(conversations) && conversations.length > 0 && activeConversationId) {
            const activeConversation = conversations.find(
                (convo) => convo.conversation_id === activeConversationId
            );
            if (activeConversation && !renameDialogOpen) {
                setActiveConversationTitle(activeConversation.title);
            }
        }
    }, [conversations, activeConversationId, renameDialogOpen]);

    // Only call the function if conversations are available
    const groupedConversations = (Array.isArray(conversations) && conversations.length > 0)
        ? groupConversationsByTime(conversations)
        : {};

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

    // Check if screen size is medium or larger
    const isMdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

    const handleItemClick = (index, convoId) => {
        // Check if the clicked conversation is already the active one
        if (convoId !== activeConversationId) {
            setIsNavigating(true);
            // Wait for the chat area to be re-rendered or initialized, then reset isNavigating to false
            setTimeout(() => setIsNavigating(false), 100); // Adjust timeout as needed
            // First, set the active conversation ID and activeEffect based on that Id
            dispatch(setActiveConversationId(convoId));
            // Then, fetch the messages for the selected conversation
            dispatch(fetchMessages(convoId));
            // Hide scrollBottom button
            setShowScrollButton(false);
            // Finally, navigate to the selected conversation route
            navigate(`/talker/c/${convoId}`);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    // handle logOut
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

    const handleNewConversation = () => {
        if (activeConversationId !== null) {
            dispatch(setActiveIndex(null));
            dispatch(clearActiveConversationId());
            dispatch(clearMessages()); // Clear previous messages
            setShowScrollButton(false);
            navigate('/talker');
        }
    };

    // moreOptions Handling
    const handleClickMore = (event) => {
        setAnchorElMore(event.currentTarget); // Open Popover when More icon is clicked
    };

    const handleCloseMore = () => {
        setAnchorElMore(null); // Close Popover when clicked outside
    };

    const handleOpenShareDialog = () => {
        setShareDialogOpen(true);
        handleCloseMore();
    };

    const handleCloseShareDialog = () => {
        setShareDialogOpen(false);
    };

    const handleOpenDeleteDialog = () => {
        setDeleteDialogOpen(true);
        handleCloseMore();
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        handleCloseMore();
    };

    const handleConfirmDelete = () => {
        setDeleteDialogOpen(false);
        dispatch(setActiveIndex(null));
        dispatch(clearMessages());
        dispatch(delConversation({ activeConversationId }));
        dispatch(delConversationFromSupabase(activeConversationId));
        dispatch(clearActiveConversationId());
        navigate('/talker');
    };

    const openMore = Boolean(anchorElMore);

    const handleRenameOpen = () => {
        setRenameDialogOpen(true); // Ensure dialog opens
        handleCloseMore();
    };

    const handleEditableTitle = (e) => {
        const value = e.target.value;
        setActiveConversationTitle(value);
    }

    const handleRenameClose = () => {
        if (activeConversationTitle.trim() === "") {
            // If input is empty, reset to the original title instead of closing
            const originalTitle = conversations.find(
                (convo) => convo.conversation_id === activeConversationId
            )?.title;
            setActiveConversationTitle(originalTitle || 'New Chat');
        }
        setRenameDialogOpen(false);
    };

    const handleRename = async () => {
        // if inputField is empty
        if (activeConversationTitle.trim() === "") {
            toast.error('Title can not be empty', {
                position: 'top-right',
                autoClose: 1500,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                theme: 'dark',
                style: {
                    backgroundColor: '#333',
                    color: '#fff',
                    fontSize: '14px',
                    padding: '10px 7px',
                    borderRadius: '10px',
                },
            });
            return;
        }
        dispatch(renConversation({ activeConversationId, newTitle: activeConversationTitle }));
        dispatch(updateConversationTitle({ activeConversationId, activeConversationTitle }));
        setRenameDialogOpen(false);
    };

    return (
        <>
            <Box sx={{ width: 257, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#171717', overflow: 'hidden' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: '8.5px !important' }}>
                    <IconButton onClick={handleDrawerClose}>
                        <MenuOpenIcon color='primary' />
                    </IconButton>
                    <IconButton onClick={handleNewConversation}>
                        <AddCircleIcon color='primary' />
                    </IconButton>
                </Toolbar>

                <List sx={{
                    flexGrow: 1, overflowY: 'auto', pt: '5px',
                    '&::-webkit-scrollbar': {
                        width: '6px', // Adjust width of the scrollbar
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#171717', // Ensure track background matches container
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#424242', // Scroll thumb color
                        borderRadius: '10px',
                        '&:hover': {
                            backgroundColor: '#676767', // Hover effect
                        },
                    },
                    '&:hover::-webkit-scrollbar-thumb': {
                        backgroundColor: '#676767', // Scroll thumb color on hover
                    },
                }}>
                    {/* App Logo Bar */}
                    <ListItem
                        sx={{
                            backgroundColor: 'transparent',
                            justifyContent: 'center',
                            pl: 2.5,
                            mb: 2.5,
                            pt: 0,
                        }}
                    >
                        <ListItemText sx={{
                            cursor: 'pointer'
                        }}
                            primary={
                                <Box onClick={handleNewConversation} sx={{
                                    display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease', // Smooth transition for scaling
                                    '&:active': {
                                        transform: 'scale(0.95)', // Squeeze effect on click
                                    },
                                }}>
                                    <Box sx={{
                                        padding: '4px',
                                        border: '1px solid #424242',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: '10px',
                                        flexShrink: 0,
                                    }}>
                                        <img src="/talkerLogo.svg" alt="App Logo" style={{ width: '16px', height: '16px' }} />
                                    </Box>
                                    <Typography sx={{ color: '#ECECEC', fontSize: '15px', fontWeight: 500 }}>TalKer</Typography>
                                </Box>
                            }
                        />
                    </ListItem>

                    {/* Conversation Area */}
                    <ConversationsArea
                        groupedConversations={groupedConversations}
                        activeConversationId={activeConversationId}
                        handleItemClick={handleItemClick}
                        handleClickMore={handleClickMore}
                        activeConversationTitle={activeConversationTitle}
                    />
                </List>

                {/* moreOptions Menu */}
                <Popover
                    open={openMore}
                    anchorEl={anchorElMore}
                    onClose={handleCloseMore}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    sx={{
                        '& .MuiPaper-root': {
                            borderRadius: '16px',
                        },
                    }}
                >
                    <List sx={{ width: 125, bgcolor: '#2F2F2F' }}>
                        <ListItem onClick={handleOpenShareDialog}>
                            <Share fontSize='small' sx={{ color: 'white', marginRight: 1 }} />
                            <ListItemText primary="Share" sx={{
                                color: 'white',
                                '& .MuiTypography-root': {
                                    fontSize: '14px',
                                },
                            }} />
                        </ListItem>
                        <ListItem onClick={handleRenameOpen}>
                            <Edit fontSize='small' sx={{ color: 'white', marginRight: 1 }} />
                            <ListItemText primary="Rename" sx={{
                                color: 'white',
                                '& .MuiTypography-root': {
                                    fontSize: '14px',
                                },
                            }} />
                        </ListItem>
                        <ListItem onClick={handleOpenDeleteDialog}>
                            <Delete fontSize='small' sx={{ color: '#F93A37', marginRight: 1 }} />
                            <ListItemText primary="Delete" sx={{
                                color: '#F93A37',
                                '& .MuiTypography-root': {
                                    fontSize: '14px',
                                },
                            }} />
                        </ListItem>
                    </List>
                </Popover>

                {/* moreOption Dialog's */}
                {/* shareDialog */}
                <ShareDialog open={shareDialogOpen} handleClose={handleCloseShareDialog} />
                {/* deleteDialog */}
                <DeleteDialog
                    open={deleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                    onConfirm={handleConfirmDelete}
                    selectedConversationId={selectedConversationId}
                    setSelectedConversationId={setSelectedConversationId}
                />
                {/* renameDialog */}
                <RenameDialog
                    open={renameDialogOpen}
                    onClose={handleRenameClose}
                    activeConversationTitle={activeConversationTitle}
                    handleRename={handleRename}
                    handleEditableTitle={handleEditableTitle}
                    setActiveConversationTitle={setActiveConversationTitle}
                />

                {/* userAccount section */}
                {/*<Box
                    onClick={handleClick}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: '8px',
                        px: '14px',
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
                                sx={{
                                    width: 40,
                                    height: 40,
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
                    <Box
                        sx={{
                            marginLeft: 1,
                            width: '100%',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Typography
                            fontSize={'14px'}
                            variant="body1"
                            color="white"
                            sx={{
                                display: 'inline-block',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%',
                            }}
                        >
                            {user && user.displayName}
                        </Typography>
                    </Box>
                </Box>*/}

                {/* menuOfUserAccount */}
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <List sx={{ width: 240, bgcolor: '#2F2F2F', border: '1px solid #444343' }}>
                        {/* Email at the top */}
                        <ListItem>
                            <Typography variant="body2" sx={{ color: 'white', py: '8px', px: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{(user) && user.email}</Typography>
                        </ListItem>

                        <Divider sx={{ bgcolor: '#444343' }} />

                        {/* Logout option */}
                        <ListItem sx={{
                            transform: clicked ? 'scale(0.95)' : 'scale(1)',
                            transition: 'transform 0.1s ease',
                            '&:hover': {
                                backgroundColor: '#444',
                            },
                        }}
                            button onClick={handleLogOut}>
                            <LogoutIcon sx={{ color: 'white', marginRight: 1 }} />
                            <ListItemText primary={clicked ? "Logging out..." : "Logout"} sx={{ color: 'white' }} />
                        </ListItem>
                    </List>
                </Popover>
            </Box>
        </>
    )
}

export default SideBarForDrawer