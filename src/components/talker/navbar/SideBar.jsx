import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Box,
  Popover,
  Divider,
  Toolbar,
  IconButton,
  Typography,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthState } from "../../../features/authSlice";
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
} from "../../../features/conversationsSlice";
import { clearMessages, fetchMessages } from "../../../features/messageSlice";
import { Share, Edit, Delete } from "@mui/icons-material";
import ShareDialog from "./ShareDialog";
import DeleteDialog from "./DeleteDialog";
import RenameDialog from "./RenameDialog";
import { toast } from "react-toastify";
import { groupConversationsByTime } from "../../../scripts/app";
import ConversationsArea from "./ConversationsArea";
import CircularProgress from "@mui/material/CircularProgress";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import MemoryIcon from "@mui/icons-material/Memory";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import FeedbackIcon from "@mui/icons-material/Feedback";
import Settings from "../Settings";
import systemTheme from "../../../scripts/muiTheme";
import YourData from "../YourData";

const SideBar = ({ isOpen, handleConBar, setShowScrollButton }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [yourDataOpened, setYourDataOpened] = useState(false);
  const [activeConversationTitle, setActiveConversationTitle] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false); // for shareOption
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // for deleteOption
  const [anchorEl, setAnchorEl] = useState(null); // for userMenu
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
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, []);

  // Check if screen size is medium or larger
  const isMdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

  const handleItemClick = (index, convoId) => {
    // Check if the clicked conversation is already the active one
    if (convoId !== activeConversationId) {
      // First, set the active conversation ID and activeEffect based on that Id
      dispatch(setActiveConversationId(convoId));
      // Then, fetch the messages for the selected conversation
      dispatch(fetchMessages(convoId));
      // Hide scrollBottom button
      setShowScrollButton(false);
      // Finally, navigate to the selected conversation route
      navigate(`/talker/c/${convoId}`);
      // Close the sidebar only if the conversation is different
      handleConBar();
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
      navigate("/"); // Redirect the user to Home-Page(loginPage)
    }, 1000); // Duration of the logOut process
  };

  const handleNewConversation = () => {
    if (activeConversationId !== null) {
      dispatch(setActiveIndex(null));
      dispatch(clearActiveConversationId());
      dispatch(clearMessages()); // Clear previous messages
      setShowScrollButton(false);
      navigate("/talker");
      handleConBar();
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
    handleConBar();
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

  const handleOpenSettings = () => {
    handleClose();
    setTimeout(() => {
      setSettingsOpened(true);
    }, 700);
  };

  const handleOpenYourData = () => {
    handleClose();
    setTimeout(() => {
      setYourDataOpened(true);
    }, 700);
  };

  return (
    <>
      <Drawer anchor="left" open={isOpen} onClose={handleConBar}>
        <Box
          sx={{
            width: 273,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            bgcolor: "#171717",
            overflow: "hidden",
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: "10px",
            }}
          >
            <IconButton onClick={handleConBar}>
              <MenuOpenIcon color="primary" />
            </IconButton>
            <IconButton onClick={handleNewConversation}>
              <AddCircleIcon color="primary" />
            </IconButton>
          </Toolbar>

          <List sx={{ flexGrow: 1, overflowY: "auto", pt: "5px" }}>
            {/* App Logo Bar */}
            <ListItem
              sx={{
                backgroundColor: "transparent",
                ...(isMdUp && {
                  "&:hover": { backgroundColor: "#212121" }, // Hover effect only for md and up
                }),
                justifyContent: "center",
                pl: 2.5,
                mb: 2.5,
                pt: 0,
              }}
            >
              <ListItemText
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
                        border: "1px solid #424242",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: "10px",
                        flexShrink: 0,
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
                        color: "#ECECEC",
                        fontSize: "15px",
                        fontWeight: 420,
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
                border: "1.2px solid #5D5D5D",
              },
            }}
          >
            <List sx={{ width: 125, bgcolor: "#2F2F2F" }}>
              <ListItem onClick={handleOpenShareDialog}>
                <Share
                  fontSize="small"
                  sx={{ color: "white", marginRight: "10px" }}
                />
                <ListItemText
                  primary="Share"
                  sx={{
                    color: "white",
                    "& .MuiTypography-root": {
                      fontSize: "14px",
                      fontWeight: "500",
                    },
                  }}
                />
              </ListItem>
              <ListItem onClick={handleRenameOpen}>
                <Edit
                  fontSize="small"
                  sx={{ color: "white", marginRight: "10px" }}
                />
                <ListItemText
                  primary="Rename"
                  sx={{
                    color: "white",
                    "& .MuiTypography-root": {
                      fontSize: "14px",
                      fontWeight: "500",
                    },
                  }}
                />
              </ListItem>
              <ListItem onClick={handleOpenDeleteDialog}>
                <Delete
                  fontSize="small"
                  sx={{ color: "#F93A37", marginRight: "10px" }}
                />
                <ListItemText
                  primary="Delete"
                  sx={{
                    color: "#F93A37",
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

          {/* userAccount section */}
          <Box
            onClick={handleClick}
            sx={{
              display: "flex",
              alignItems: "center",
              py: "8px",
              px: "14px",
              marginTop: "auto",
              backgroundColor: open ? "#212121" : "transparent",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: 40,
                height: 40,
              }}
            >
              {loading ? (
                <CircularProgress
                  size={40} // Matches the Avatar size
                  sx={{
                    position: "absolute",
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
                    e.target.src = ""; // Clear broken image URL to force fallback
                  }}
                >
                  <AccountCircle
                    sx={{
                      fontSize: 40, // Match the Avatar size
                      color: "#757575", // Default grey color for the icon
                    }}
                  />
                </Avatar>
              )}
            </Box>
            <Box
              sx={{
                marginLeft: 1,
                width: "100%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                fontSize={"14px"}
                variant="body1"
                color="white"
                sx={{
                  display: "inline-block",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {user && user.displayName}
              </Typography>
            </Box>
          </Box>

          {/* menuOfUserAccount */}
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            sx={{
              "& .MuiPaper-root": {
                borderRadius: ".5rem",
                border: "1px solid #5D5D5D",
              },
            }}
            transitionDuration={{
              appear: 0, // No delay for appearing
              enter: 0, // No delay for entering (showing)
              exit: 700, // Add a delay (200ms) for closing
            }}
          >
            <List sx={{ width: 240, bgcolor: "#2F2F2F", padding: "6px" }}>
              {/* Email at the top */}
              <ListItem
                sx={{
                  py: "12px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#E3E3E3",
                    px: "2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {user && user.email}
                </Typography>
              </ListItem>
              <Divider sx={{ bgcolor: "#5D5D5D", height: "1px" }} />

              {/* Mid Part */}
              {/* Your Data */}
              <ListItem
                onClick={handleOpenYourData}
                button
                sx={{
                  px: "16px",
                  pt: "8px",
                  pb: "4px",
                  borderRadius: "9px",
                  ":hover": {
                    bgcolor: systemTheme.palette.customColors.hoverColor,
                  },
                }}
              >
                <PersonIcon
                  sx={{ color: "#E3E3E3", marginRight: 1, fontSize: "18px" }}
                />
                <ListItemText
                  primary={
                    <Typography sx={{ color: "#E3E3E3", fontSize: "14px" }}>
                      Your Data
                    </Typography>
                  }
                  sx={{ color: "#E3E3E3", fontSize: "14px !important" }}
                />
              </ListItem>
              {/* Memory */}
              <ListItem
                button
                sx={{
                  px: "16px",
                  pt: "4px",
                  pb: "4px",
                  borderRadius: "9px",
                  ":hover": {
                    bgcolor: systemTheme.palette.customColors.hoverColor,
                  },
                }}
              >
                <MemoryIcon
                  sx={{ color: "#E3E3E3", marginRight: 1, fontSize: "18px" }}
                />
                <ListItemText
                  primary={
                    <Typography sx={{ color: "#E3E3E3", fontSize: "14px" }}>
                      Memory
                    </Typography>
                  }
                  sx={{ color: "#E3E3E3", fontSize: "14px !important" }}
                />
              </ListItem>
              {/* Security */}
              <ListItem
                button
                sx={{
                  px: "16px",
                  pt: "4px",
                  pb: "4px",
                  borderRadius: "9px",
                  ":hover": {
                    bgcolor: systemTheme.palette.customColors.hoverColor,
                  },
                }}
              >
                <SecurityIcon
                  sx={{ color: "#E3E3E3", marginRight: 1, fontSize: "18px" }}
                />
                <ListItemText
                  primary={
                    <Typography sx={{ color: "#E3E3E3", fontSize: "14px" }}>
                      Security
                    </Typography>
                  }
                  sx={{ color: "#E3E3E3", fontSize: "14px !important" }}
                />
              </ListItem>
              {/* Settings */}
              <ListItem
                onClick={handleOpenSettings}
                button
                sx={{
                  pt: "4px",
                  pb: "8px",
                  borderRadius: "9px",
                  mb: "3px",
                  ":hover": {
                    bgcolor: systemTheme.palette.customColors.hoverColor,
                  },
                }}
              >
                <SettingsIcon
                  sx={{ color: "#E3E3E3", marginRight: 1, fontSize: "18px" }}
                />
                <ListItemText
                  primary={
                    <Typography sx={{ color: "#E3E3E3", fontSize: "14px" }}>
                      Settings
                    </Typography>
                  }
                  sx={{ color: "#E3E3E3", fontSize: "14px !important" }}
                />
              </ListItem>
              <Divider sx={{ bgcolor: "#5D5D5D", height: "1px" }} />
              {/* FeedBack */}
              <ListItem
                sx={{
                  ":hover": {
                    bgcolor: systemTheme.palette.customColors.hoverColor,
                  },
                  borderRadius: "9px",
                }}
                button
              >
                <FeedbackIcon
                  sx={{ color: "#E3E3E3", marginRight: 1, fontSize: "18px" }}
                />
                <ListItemText
                  primary={
                    <Typography sx={{ color: "#E3E3E3", fontSize: "14px" }}>
                      Feedback
                    </Typography>
                  }
                  sx={{ color: "#E3E3E3", fontSize: "14px !important" }}
                />
              </ListItem>
              <Divider sx={{ bgcolor: "#5D5D5D", height: "1px" }} />

              {/* Logout option */}
              <ListItem
                sx={{
                  transform: clicked ? "scale(0.95)" : "scale(1)",
                  transition: "transform 0.1s ease",
                  borderRadius: "9px",
                  "&:hover": {
                    bgcolor: systemTheme.palette.customColors.hoverColor,
                  },
                  mt: "3px",
                }}
                button
                onClick={handleLogOut}
              >
                <LogoutIcon
                  sx={{ color: "#E3E3E3", marginRight: 1, fontSize: "18px" }}
                />
                <ListItemText
                  primary={
                    <Typography sx={{ color: "#E3E3E3", fontSize: "14px" }}>
                      {clicked ? "Logging out..." : "Logout"}
                    </Typography>
                  }
                  sx={{ color: "#E3E3E3", fontSize: "14px !important" }}
                />
              </ListItem>
            </List>
          </Popover>
          {/* renderingUserMenuComponents */}
          <Settings
            settingsOpened={settingsOpened}
            setSettingsOpened={setSettingsOpened}
          />
          <YourData
            yourDataOpened={yourDataOpened}
            setYourDataOpened={setYourDataOpened}
          />
        </Box>
      </Drawer>
    </>
  );
};

export default SideBar;
