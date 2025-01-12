import React, { useContext, useState } from "react";
import {
  Box,
  Divider,
  Backdrop,
  IconButton,
  Button,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { StateContext } from "../../main";
import { getAuth, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { setAuthState } from "../../features/authSlice";
import {
  clearActiveConversationId,
  delAllChats,
  delAllChatsFromSupabase,
} from "../../features/conversationsSlice";
import { useNavigate } from "react-router-dom";
import { clearMessages } from "../../features/messageSlice";

const Settings = ({ settingsOpened, setSettingsOpened }) => {
  const auth = getAuth();
  const userId = auth.currentUser.uid;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const conversations = useSelector(
    (state) => state.conversations.conversations
  );
  const [open, setOpen] = useState(false); // State to control dialog visibility
  const [clicked, setClicked] = useState(false);

  const handleDelAllChats = () => {
    // Handle delete chats functionality here
    setSettingsOpened(false); // Close the settings dialog
    setOpen(true); // open the confirmation dialog
  };

  // handle logOut
  const handleLogOut = () => {
    setClicked(true);
    // firebase logOut functionality
    setTimeout(async () => {
      await signOut(auth);
      dispatch(setAuthState()); // set the userAuthenticated state to false first that have using in authSlice
      dispatch(clearActiveConversationId());
      navigate("/"); // Redirect the user to Home-Page(loginPage)
    }, 1000); // Duration of the logOut process
  };

  // Function to handle dialog close
  const handleCloseDialog = () => {
    setOpen(false);
    setSettingsOpened(true);
  };

  // Function to handle confirm deletion
  const handleConfirmDeletion = () => {
    const chatsExist = conversations.length > 0; // Check if there are chats in the Redux state
    if (!chatsExist) {
      setOpen(false); // Close the dialog
      setSettingsOpened(true);
      return;
    }
    // Proceed with deletion if chats exist
    dispatch(clearMessages()); // Clear messages
    dispatch(delAllChats()); // Clear local state
    dispatch(clearActiveConversationId()); // Clear active conversation
    dispatch(delAllChatsFromSupabase(userId)); // Delete from Supabase
    navigate('/talker');
    setOpen(false); // Close the dialog
    setSettingsOpened(true);
  };

  return (
    <>
      {/* Backdrop */}
      {(settingsOpened || open) && (
        <Backdrop
          open={settingsOpened || open}
          sx={{
            zIndex: 9999, // Ensure the backdrop is behind the settings dialog but above other UI elements
            bgcolor: "rgba(5, 5, 5, 0.7)", // Semi-transparent black background
          }}
        />
      )}

      {/* Settings Dialog */}
      {settingsOpened && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#2F2F2F",
            padding: 2,
            borderRadius: "16px",
            width: "90%",
            maxWidth: "600px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 10000,
          }}
        >
          {/* Header with Close Icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ color: "#FFFFFF" }}>
              Settings
            </Typography>
            <IconButton
              onClick={() => setSettingsOpened(false)}
              sx={{ color: "#FFFFFF" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 2, backgroundColor: "#444444" }} />

          {/* Settings List */}
          <Box>
            {/* Delete All Chats */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ color: "#FFFFFF" }}>
                Delete All Chats
              </Typography>
              <Button
                variant="contained"
                onClick={handleDelAllChats}
                sx={{
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  borderRadius: "50px",
                  "&:hover": {
                    backgroundColor: "#D83F3F",
                  },
                }}
              >
                Delete All
              </Button>
            </Box>
            <Divider sx={{ my: 1, backgroundColor: "#444444" }} />

            {/* Logout */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ color: "#FFFFFF" }}>
                Logout on this Device
              </Typography>
              <Button
                variant="outlined"
                onClick={handleLogOut}
                sx={{
                  backgroundColor: "#2F2F2F",
                  color: "#FFFFFF",
                  borderRadius: "50px",
                  border: "1px solid #444444",
                  "&:hover": {
                    backgroundColor: "#444444",
                  },
                }}
              >
                {clicked ? "Logging out..." : "Logout"}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      {/* DelAllChats Confirmation Dialog */}
      {open && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#2F2F2F",
            padding: 2,
            borderRadius: "16px",
            width: "90%",
            maxWidth: "600px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 10000,
          }}
        >
          {/* Heading */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 2, // Space between heading and paragraph
            }}
          >
            <Typography variant="h6" sx={{ color: "#FFFFFF" }}>
              Clear your chat history - are you sure?
            </Typography>
          </Box>

          {/* Paragraph explaining action */}
          <Typography
            sx={{
              color: "#B3B3B3",
              fontSize: "1rem",
              marginBottom: 3, // Space between paragraph and buttons
            }}
          >
            Deleting all chats is a permanent action and cannot be undone.
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2, // Space between buttons
            }}
          >
            {/* Cancel Button */}
            <Button
              onClick={handleCloseDialog} // Replace with your function to close the dialog
              sx={{
                border: "1px solid #424242",
                bgcolor: "#2F2F2F",
                color: "#FFFFFF",
                borderRadius: "50px",
                padding: "8px 16px",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#3C3C3C",
                },
              }}
            >
              Cancel
            </Button>

            {/* Confirm Deletion Button */}
            <Button
              onClick={handleConfirmDeletion} // Replace with your function to confirm deletion
              sx={{
                bgcolor: "#EF4444",
                color: "#FFFFFF",
                borderRadius: "50px",
                padding: "8px 16px",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#D32F2F",
                },
              }}
            >
              Confirm Deletion
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Settings;
