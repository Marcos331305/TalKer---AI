import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  Button,
  Typography,
  Popover,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import {
  currentlySharedLinkToken,
  delAllSharedLinks,
  delAllSharedLinksFromSupabase,
  delSharedLink,
  delSharedLinkFromSupabase,
} from "../../features/sharedLinksSlice";
import { useTheme } from "@emotion/react";
import { getAuth } from "firebase/auth";

const SharedLinks = ({
  setYourDataOpened,
  openSharedLinks,
  setOpenSharedLinks,
}) => {
  const auth = getAuth();
  const userId = auth.currentUser.uid;
  const theme = useTheme();
  const dispatch = useDispatch();
  const [linkToOpen, setLinkToOpen] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  // Access sharedLinks state's from Redux Store
  const { sharedLinks, sharedLinkToken, loading, error } = useSelector(
    (state) => state.sharedLinks
  );

  useEffect(() => {
    if (sharedLinkToken && linkToOpen) {
      window.open(`/talker/share/${linkToOpen}/${sharedLinkToken}`, "_blank");
      setLinkToOpen(null); // Reset linkToOpen after opening the link
    }
  }, [sharedLinkToken, linkToOpen]);

  const handleCloseDialog = () => {
    setOpenSharedLinks(false);
    setYourDataOpened(true);
  };

  const handleLinkClick = (linkId) => {
    setLinkToOpen(linkId);
    // get the clicked link's linkToken
    dispatch(currentlySharedLinkToken({ conversationId: linkId }));
  };

  const handleSourceChatClick = (conversationId) => {
    window.open(`/talker/c/${conversationId}`, "_blank");
  };

  const handleDeleteSharedLink = (link_id) => {
    // Delete the shared link from reduxState for immediate UI update
    dispatch(delSharedLink({ link_id }));
    // Delete the shared link from the supabaase
    dispatch(delSharedLinkFromSupabase(link_id));
  };

  const isPopoverOpen = Boolean(anchorEl);
  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleDeleteAllSharedLinks = () => {
    dispatch(delAllSharedLinks());
    dispatch(delAllSharedLinksFromSupabase(userId));
  };

  return (
    <>
      {/* SharedLinks Dialog */}
      {openSharedLinks && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#2F2F2F",
            padding: 2,
            borderRadius: "16px",
            maxWidth: "1024px",
            width: "calc(100% - 16px)",
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
            <Typography variant="h6" sx={{ color: "#F9F9F9" }}>
              Shared Links
            </Typography>
            <IconButton
              onClick={handleCloseDialog}
              sx={{ color: "#F9F9F9", pr: 0 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Divider */}
          <Divider sx={{ backgroundColor: "#444444", marginY: 1 }} />

          {/* loadingText */}
          {loading && (
            <Typography sx={{ color: "#B4B4B4", fontSize: "16px" }}>
              Loading...
            </Typography>
          )}

          {/* sharedLinks Table */}
          {!loading && !error && sharedLinks.length > 0 && (
            <Box
              sx={{
                maxHeight: "calc(10 * 48px)", // Approx. 10 rows height
                overflowY: "auto",
                padding: 1,
                maxHeight: "calc(10 * 48px)", // Approx. 10 rows height (row height ~48px)
                backgroundColor: "#1E1E1E",
                borderRadius: "8px",
                "&::-webkit-scrollbar": {
                  width: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#676767", // Custom scrollbar thumb color
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "none", // Removes scrollbar track
                },
              }}
            >
              {/* Headings Row */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 16px",
                  position: "sticky",
                  top: -8.00999,
                  backgroundColor: "#2F2F2F",
                  zIndex: 1,
                  borderRadius: "8px",
                }}
              >
                <Typography sx={{ flex: 1, color: "#F9F9F9", fontWeight: 500 }}>
                  Name
                </Typography>
                <Typography
                  sx={{
                    flex: 1,
                    textAlign: "center",
                    color: "#F9F9F9",
                    fontWeight: 500,
                    lineHeight: "20px",
                    // ml: 2.7,
                    // "@media (min-width: 768px)": {
                    //   ml: 0,
                    // },
                  }}
                >
                  Date Shared
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton
                    onClick={handleOpenPopover}
                    sx={{ color: "#F9F9F9", p: "4px" }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Render Rows */}
              {sharedLinks.map((link, index) => (
                <React.Fragment key={link?.link_id_token || index}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 16px",
                    }}
                  >
                    {/* Name */}
                    <Typography
                      sx={{
                        flex: 1,
                        color: "#3A88FF",
                        textDecoration: "underline",
                        lineHeight: "20px",
                        "@media (max-width: 600px)": {
                          pr: 1,
                        },
                        textDecorationThickness: "1px",
                        textUnderlineOffset: "2px",
                        ":hover": { cursor: "pointer" },
                      }}
                      onClick={() => handleLinkClick(link.conversation_id)}
                    >
                      {link?.clickable_name}
                    </Typography>
                    {/* Date Shared */}
                    <Typography
                      sx={{
                        flex: 1,
                        textAlign: "center",
                        color: "#F9F9F9",
                        lineHeight: "20px",
                        // ml: 1,
                        // "@media (min-width: 768px)": {
                        //   ml: 0,
                        // },
                      }}
                    >
                      {link?.shared_date}
                    </Typography>
                    {/* Actions */}
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <IconButton
                        sx={{ color: "#B4B4B4", p: "4px", pt: "7px" }}
                        onClick={() =>
                          handleSourceChatClick(link.conversation_id)
                        }
                      >
                        <ChatIcon />
                      </IconButton>
                      <IconButton
                        sx={{ color: "#B4B4B4", p: "4px" }}
                        onClick={() =>
                          handleDeleteSharedLink(link.link_id_token)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  {/* No Divider After Last Row */}
                  {index < sharedLinks.length - 1 && (
                    <Divider sx={{ backgroundColor: "#444444", marginX: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          )}
          {/* No Shared Links */}
          {!loading && !error && sharedLinks.length === 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <Typography
                sx={{
                  color: "#B4B4B4",
                  textAlign: "center",
                  marginTop: "16px",
                  paddingBottom: "32px",
                  fontSize: "16px",
                }}
              >
                You have no shared links.
              </Typography>
            </Box>
          )}
        </Box>
      )}
      {/* Delete all sharedLinks Popover */}
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#2F2F2F",
            borderRadius: "16px", // Rounded corners
            border: "1px solid #4E4E4E", // Border styling
            boxShadow: "none", // Remove default shadow
          },
          zIndex: 100000,
        }}
      >
        {/* Menu Item Inside the Popover */}
        <MenuItem 
          onClick={()=>{
            const userConfirmed = window.confirm('Are you sure you want to delete all your shared links?')
            handleClosePopover()
            if(userConfirmed){
              handleDeleteAllSharedLinks()
            }
          }}
          sx={{
            color: '#F93A37',
            fontSize: '14px',
            borderRadius: "8px", // Rounded corners for the hover effect
            padding: "8px 16px",
            [theme.breakpoints.up("md")]: {
              "&:hover": {
                backgroundColor: "#424242", // Hover effect only for larger screens
              },
              m: 1,
            },
            "&:active": {
              backgroundColor: "transparent", // Remove active state effect
            },
            "&.MuiMenuItem-root": {
              transition: "none", // Disable transition effects
            },
          }}
        >
          Delete all shared links
        </MenuItem>
      </Popover>
    </>
  );
};

export default SharedLinks;
