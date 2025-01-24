import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChatArea from "./ChatArea";
import MsgInput from "./MsgInput";
import SideBarForDrawer from "./SideBarForDrawer";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  clearActiveConversationId,
  setActiveIndex,
} from "../../features/conversationsSlice.js";
import { clearMessages } from "../../features/messageSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Divider, List, ListItem, ListItemText, Popover } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { setAuthState } from "../../features/authSlice.js";
import PersonIcon from "@mui/icons-material/Person";
import MemoryIcon from "@mui/icons-material/Memory";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import FeedbackIcon from "@mui/icons-material/Feedback";
import Button from "@mui/material/Button";
import ShareIcon from "@mui/icons-material/Share";
import ShareDialog from "./navbar/ShareDialog.jsx";
import Settings from "./Settings.jsx";
import systemTheme from "../../scripts/muiTheme.js";
import YourData from "./YourData.jsx";
import { format } from "date-fns";
import { customAlphabet } from "nanoid";
import { addSharedLink, storeSharedLinkInSupabase } from "../../features/sharedLinksSlice.js";

const drawerWidth = 260;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    variants: [
      {
        props: ({ open }) => open,
        style: {
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: 0,
        },
      },
    ],
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function UiWithDrawer({
  isNavigating,
  setIsNavigating,
  showScrollButton,
  setShowScrollButton,
  messageInputRef,
  chatContainerRef,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [clicked, setClicked] = useState(false);
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [yourDataOpened, setYourDataOpened] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false); // for shareOption
  const [activeConversationTitle, setActiveConversationTitle] = useState("");
  const activeConversationId = useSelector(
    (state) => state.conversations.activeConversationId
  );

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
      navigate("/talker");
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
      navigate("/"); // Redirect the user to Home-Page(loginPage)
    }, 1000); // Duration of the logOut process
  };
  const handleOpenShareDialog = () => {
    setShareDialogOpen(true);
  };

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
  };
  const handleOpenSettings = () => {
    handleClose();
    setSettingsOpened(true);
  };
  const handleOpenYourData = () => {
    handleClose();
    setYourDataOpened(true);
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
      <Box sx={{ display: "flex", height: "100vh", width: "100% !important" }}>
        <CssBaseline />
        <AppBar
          open={open}
          sx={{
            bgcolor: "#212121",
            boxShadow: "none",
            position: "fixed",
            top: 0,
            zIndex: 1100,
          }}
        >
          <Toolbar>
            {/* Left Side: Plus Icon + TalKerAI */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={[open && { display: "none" }]}
              >
                <MenuIcon color="primary" />
              </IconButton>
              {!open && (
                <IconButton onClick={handleNewConversation}>
                  <AddCircleIcon color="primary" />
                </IconButton>
              )}
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontSize: "18px",
                  marginInline: open ? "0px" : "12px",
                  color: systemTheme.palette.text.secondary,
                }}
              >
                TalKerAI
              </Typography>
            </Box>

            {/* Right Side: shareBtn & userAvatar */}
            <Box
              sx={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
              }}
            >
              {/* shareBtn */}
              {activeConversationId !== null && (
                <Box>
                  <Button
                    onClick={()=>{
                      handleOpenShareDialog();
                      handleSharedLinkManaging();
                    }}
                    variant="outlined"
                    sx={{
                      px: "14px",
                      py: "8px",
                      fontSize: "14px",
                      textTransform: "none", // To avoid uppercase text
                      borderRadius: "50px", // Fully rounded border
                      color: systemTheme.palette.text.primary, // Default text color
                      display: "flex",
                      alignItems: "center",
                      gap: "6px", // Gap between icon and text
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: systemTheme.palette.customColors.borderColor,
                      "&:hover": {
                        backgroundColor: systemTheme.palette.secondary.main, // Hover background color
                        borderColor:
                          systemTheme.palette.customColors.borderColor, // Optional: Maintain border color on hover
                      },
                    }}
                  >
                    <ShareIcon
                      sx={{
                        fontSize: "16px",
                        color: systemTheme.palette.text.primary,
                      }}
                    />
                    Share
                  </Button>
                </Box>
              )}
              {/* userAvatar */}
              <Box
                onClick={handleClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
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
                      onClick={handleClick}
                      sx={{
                        width: 40,
                        height: 40,
                        transition: "0.3s", // Smooth transition of styles
                        "&:hover": {
                          borderStyle: "solid",
                          borderWidth: "1px",
                          borderColor:
                            systemTheme.palette.customColors.customColor,
                        },
                        cursor: "pointer",
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
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        {/* shareDialog */}
        <ShareDialog
          open={shareDialogOpen}
          handleClose={handleCloseShareDialog}
        />
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "#171717",
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
            activeConversationTitle={activeConversationTitle}
            setActiveConversationTitle={setActiveConversationTitle}
          />
        </Drawer>
        <Main
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            mt: "64px",
            p: 0,
            overflow: "hidden",
          }}
          open={open}
        >
          {/* ChatArea */}
          <ChatArea chatContainerRef={chatContainerRef} />
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
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          PaperProps={{
            sx: {
              mt: "5px", // Add spacing between Popover and Avatar
            },
          }}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: "14px",
              borderColor: systemTheme.palette.customColors.specialBorderColor,
              borderWidth: "1px",
              borderStyle: "solid",
            },
          }}
        >
          <List
            sx={{
              width: 240,
              bgcolor: systemTheme.palette.secondary.main,
              padding: "8px",
              boxSizing: "border-box",
            }}
          >
            {/* Email at the top */}
            <ListItem
              sx={{
                py: "12px",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: systemTheme.palette.customColors.customColor,
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
            <Divider
              sx={{
                bgcolor: systemTheme.palette.customColors.specialBorderColor,
                height: "1px",
              }}
            />

            {/* Mid Part */}
            {/* Your Data */}
            <ListItem
              button
              onClick={handleOpenYourData}
              sx={{
                px: "16px",
                pt: "8px",
                pb: "4px",
                mt: "3px",
                cursor: "pointer",
                borderRadius: "9px",
                ":hover": {
                  bgcolor: systemTheme.palette.customColors.hoverColor,
                },
              }}
            >
              <PersonIcon
                sx={{
                  color: systemTheme.palette.customColors.moreOptionIconsColor,
                  marginRight: 1,
                  fontSize: "18px",
                }}
              />
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      color: systemTheme.palette.customColors.customColor,
                      fontSize: "14px",
                    }}
                  >
                    Your Data
                  </Typography>
                }
              />
            </ListItem>
            {/* Memory */}
            <ListItem
              button
              sx={{
                px: "16px",
                pt: "4px",
                pb: "4px",
                cursor: "pointer",
                borderRadius: "9px",
                ":hover": {
                  bgcolor: systemTheme.palette.customColors.hoverColor,
                },
              }}
            >
              <MemoryIcon
                sx={{
                  color: systemTheme.palette.customColors.moreOptionIconsColor,
                  marginRight: 1,
                  fontSize: "18px",
                }}
              />
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      color: systemTheme.palette.customColors.customColor,
                      fontSize: "14px",
                    }}
                  >
                    Memory
                  </Typography>
                }
              />
            </ListItem>
            {/* Security */}
            <ListItem
              button
              sx={{
                px: "16px",
                pt: "4px",
                pb: "4px",
                cursor: "pointer",
                borderRadius: "9px",
                ":hover": {
                  bgcolor: systemTheme.palette.customColors.hoverColor,
                },
              }}
            >
              <SecurityIcon
                sx={{
                  color: systemTheme.palette.customColors.moreOptionIconsColor,
                  marginRight: 1,
                  fontSize: "18px",
                }}
              />
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      color: systemTheme.palette.customColors.customColor,
                      fontSize: "14px",
                    }}
                  >
                    Security
                  </Typography>
                }
              />
            </ListItem>
            {/* Settings */}
            <ListItem
              button
              onClick={handleOpenSettings}
              sx={{
                pt: "4px",
                pb: "8px",
                cursor: "pointer",
                borderRadius: "9px",
                mb: "3px",
                ":hover": {
                  bgcolor: systemTheme.palette.customColors.hoverColor,
                },
              }}
            >
              <SettingsIcon
                sx={{
                  color: systemTheme.palette.customColors.moreOptionIconsColor,
                  marginRight: 1,
                  fontSize: "18px",
                }}
              />
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      color: systemTheme.palette.customColors.customColor,
                      fontSize: "14px",
                    }}
                  >
                    Settings
                  </Typography>
                }
              />
            </ListItem>
            <Divider
              sx={{
                bgcolor: systemTheme.palette.customColors.specialBorderColor,
                height: "1px",
              }}
            />
            {/* FeedBack */}
            <ListItem
              button
              sx={{
                cursor: "pointer",
                borderRadius: "9px",
                ":hover": {
                  bgcolor: systemTheme.palette.customColors.hoverColor,
                },
                my: "3px",
              }}
            >
              <FeedbackIcon
                sx={{
                  color: systemTheme.palette.customColors.moreOptionIconsColor,
                  marginRight: 1,
                  fontSize: "18px",
                }}
              />
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      color: systemTheme.palette.customColors.customColor,
                      fontSize: "14px",
                    }}
                  >
                    FeedBack
                  </Typography>
                }
              />
            </ListItem>
            <Divider
              sx={{
                bgcolor: systemTheme.palette.customColors.specialBorderColor,
                height: "1px",
              }}
            />

            {/* Logout option */}
            <ListItem
              sx={{
                transform: clicked ? "scale(0.95)" : "scale(1)",
                transition: "transform 0.1s ease",
                mt: "3px",
                "&:hover": {
                  backgroundColor: systemTheme.palette.customColors.hoverColor,
                },
                cursor: "pointer",
                borderRadius: "9px",
              }}
              button
              onClick={handleLogOut}
            >
              <LogoutIcon
                sx={{
                  color: systemTheme.palette.customColors.moreOptionIconsColor,
                  marginRight: 1,
                  fontSize: "18px",
                }}
              />
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      color: systemTheme.palette.customColors.customColor,
                      fontSize: "14px",
                    }}
                  >
                    {clicked ? "Logging out..." : "Logout"}
                  </Typography>
                }
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
    </>
  );
}
