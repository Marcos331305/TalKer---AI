import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Box,
  Popover,
  Toolbar,
  IconButton,
  Typography,
} from "@mui/material";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  clearActiveConversationId,
  delConversation,
  delConversationFromSupabase,
  renConversation,
  setActiveConversationId,
  setActiveIndex,
  updateConversationTitle,
} from "../../features/conversationsSlice";
import { clearMessages, fetchMessages } from "../../features/messageSlice";
import { Share, Edit, Delete } from "@mui/icons-material";
import ShareDialog from "./navbar/ShareDialog";
import DeleteDialog from "./navbar/DeleteDialog";
import RenameDialog from "./navbar/RenameDialog";
import { toast } from "react-toastify";
import { groupConversationsByTime } from "../../scripts/app";
import ConversationsArea from "./navbar/ConversationsArea";
import systemTheme from "../../scripts/muiTheme";
import {
  addSharedLink,
  storeSharedLinkInSupabase,
} from "../../features/sharedLinksSlice";
import { customAlphabet } from "nanoid";
import { format } from "date-fns";

const SideBarForDrawer = ({
  setShowScrollButton,
  handleDrawerClose,
  setIsNavigating,
  activeConversationTitle,
  setActiveConversationTitle
}) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false); // for shareOption
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // for deleteOption
  const [anchorElMore, setAnchorElMore] = useState(null); // for moreIcon
  const activeConversationId = useSelector(
    (state) => state.conversations.activeConversationId
  );
  // fetch conversationsState from the conversationsSlice to use in sideBars ui
  const { conversations = [] } = useSelector(
    (state) => state.conversations || {}
  );

  useEffect(() => {
    if (
      Array.isArray(conversations) &&
      conversations.length > 0 &&
      activeConversationId
    ) {
      const activeConversation = conversations.find(
        (convo) => convo.conversation_id === activeConversationId
      );
      if (activeConversation && !renameDialogOpen) {
        setActiveConversationTitle(activeConversation.title);
      }
    }
  }, [conversations, activeConversationId, renameDialogOpen]);

  // Only call the function if conversations are available
  const groupedConversations =
    Array.isArray(conversations) && conversations.length > 0
      ? groupConversationsByTime(conversations)
      : {};

  // useEffect for getting the userDetails when the component Mount's
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUser(user);
      } else {
        // User is signed out
        setUser(null);
      }
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, []);

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

  const handleNewConversation = () => {
    if (activeConversationId !== null) {
      dispatch(setActiveIndex(null));
      dispatch(clearActiveConversationId());
      dispatch(clearMessages()); // Clear previous messages
      setShowScrollButton(false);
      navigate("/talker");
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
    navigate("/talker");
  };

  const openMore = Boolean(anchorElMore);

  const handleRenameOpen = () => {
    setRenameDialogOpen(true); // Ensure dialog opens
    handleCloseMore();
  };

  const handleEditableTitle = (e) => {
    const value = e.target.value;
    setActiveConversationTitle(value);
  };

  const handleRenameClose = () => {
    if (activeConversationTitle.trim() === "") {
      // If input is empty, reset to the original title instead of closing
      const originalTitle = conversations.find(
        (convo) => convo.conversation_id === activeConversationId
      )?.title;
      setActiveConversationTitle(originalTitle || "New Chat");
    }
    setRenameDialogOpen(false);
  };

  const handleRename = async () => {
    // if inputField is empty
    if (activeConversationTitle.trim() === "") {
      toast.error("Title can not be empty", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
        style: {
          backgroundColor: "#333",
          color: "#fff",
          fontSize: "14px",
          padding: "10px 7px",
          borderRadius: "10px",
        },
      });
      return;
    }
    dispatch(
      renConversation({
        activeConversationId,
        newTitle: activeConversationTitle,
      })
    );
    dispatch(
      updateConversationTitle({ activeConversationId, activeConversationTitle })
    );
    setRenameDialogOpen(false);
  };
  const handleSharedLinkManaging = () => {
    // Define the alphabet to use (e.g., alphanumeric characters)
    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    // Create a nanoid generator with a fixed size of 4
    const generateToken = customAlphabet(alphabet, 4);
    const linkToken = generateToken();
    // getting the sharedDate in desired format
    const currentDate = new Date();
    const formattedDate = format(currentDate, "MMMM dd, yyyy");
    // store sharedLink in reduxState for immediate UI update
    dispatch(
      addSharedLink({
        link_id_token: linkToken,
        clickable_name: activeConversationTitle,
        conversation_id: activeConversationId,
        shared_date: formattedDate,
      })
    );
    // store sharedLink in supabase
    dispatch(
      storeSharedLinkInSupabase({
        link_token: linkToken,
        userId: user.uid,
        title: activeConversationTitle,
        convoId: activeConversationId,
      })
    );
  };

  return (
    <>
      <Box
        sx={{
          width: 257,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          bgcolor: systemTheme.palette.customColors.sideBarBgColor,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: "8.5px !important",
          }}
        >
          <IconButton onClick={handleDrawerClose}>
            <MenuOpenIcon color="primary" />
          </IconButton>
          <IconButton onClick={handleNewConversation}>
            <AddCircleIcon color="primary" />
          </IconButton>
        </Toolbar>

        <List
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            pt: "5px",
            "&::-webkit-scrollbar": {
              width: "6px", // Adjust width of the scrollbar
            },
            "&::-webkit-scrollbar-track": {
              background: "#171717", // Ensure track background matches container
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#424242", // Scroll thumb color
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: "#676767", // Hover effect
              },
            },
            "&:hover::-webkit-scrollbar-thumb": {
              backgroundColor: "#676767", // Scroll thumb color on hover
            },
          }}
        >
          {/* App Logo Bar */}
          <ListItem
            sx={{
              backgroundColor: "transparent",
              justifyContent: "center",
              pl: 2.5,
              mb: 2.5,
              pt: 0,
            }}
          >
            <ListItemText
              sx={{
                cursor: "pointer",
              }}
              primary={
                <Box
                  onClick={handleNewConversation}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    transition: "transform 0.2s ease", // Smooth transition for scaling
                    "&:active": {
                      transform: "scale(0.95)", // Squeeze effect on click
                    },
                  }}
                >
                  <Box
                    sx={{
                      padding: "4px",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: "10px",
                      flexShrink: 0,
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: systemTheme.palette.customColors.borderColor,
                    }}
                  >
                    <img
                      src="/talkerLogo.svg"
                      alt="App Logo"
                      style={{ width: "16px", height: "16px" }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      color: systemTheme.palette.text.primary,
                      fontSize: "15px",
                      fontWeight: 500,
                    }}
                  >
                    TalKer
                  </Typography>
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
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: "16px",
              borderWidth: "1.2px",
              borderStyle: "solid",
              borderColor: systemTheme.palette.customColors.specialBorderColor,
            },
          }}
        >
          <List
            sx={{ width: 125, bgcolor: systemTheme.palette.secondary.main }}
          >
            <ListItem
              onClick={() => {
                handleOpenShareDialog();
                handleSharedLinkManaging();
              }}
              sx={{
                cursor: "pointer",
                ":hover": {
                  bgcolor: systemTheme.palette.customColors.hoverColor,
                },
              }}
            >
              <Share
                fontSize="small"
                sx={{
                  color: systemTheme.palette.customColors.moreOptionIconsColor,
                  marginRight: "10px",
                }}
              />
              <ListItemText
                primary="Share"
                sx={{
                  color: systemTheme.palette.customColors.customColor,
                  "& .MuiTypography-root": {
                    fontSize: "14px",
                    fontWeight: "500",
                  },
                }}
              />
            </ListItem>
            <ListItem
              onClick={handleRenameOpen}
              sx={{
                cursor: "pointer",
                ":hover": {
                  bgcolor: systemTheme.palette.customColors.hoverColor,
                },
              }}
            >
              <Edit
                fontSize="small"
                sx={{
                  color: systemTheme.palette.customColors.moreOptionIconsColor,
                  marginRight: "10px",
                }}
              />
              <ListItemText
                primary="Rename"
                sx={{
                  color: systemTheme.palette.customColors.customColor,
                  "& .MuiTypography-root": {
                    fontSize: "14px",
                    fontWeight: "500",
                  },
                }}
              />
            </ListItem>
            <ListItem
              onClick={handleOpenDeleteDialog}
              sx={{
                cursor: "pointer",
                ":hover": {
                  bgcolor: systemTheme.palette.customColors.hoverColor,
                },
              }}
            >
              <Delete
                fontSize="small"
                sx={{
                  color: systemTheme.palette.customColors.delete,
                  marginRight: "10px",
                }}
              />
              <ListItemText
                primary="Delete"
                sx={{
                  color: systemTheme.palette.customColors.delete,
                  "& .MuiTypography-root": {
                    fontSize: "14px",
                    fontWeight: "500",
                  },
                }}
              />
            </ListItem>
          </List>
        </Popover>

        {/* moreOption Dialog's */}
        {/* shareDialog */}
        <ShareDialog
          open={shareDialogOpen}
          handleClose={handleCloseShareDialog}
        />
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
      </Box>
    </>
  );
};

export default SideBarForDrawer;
