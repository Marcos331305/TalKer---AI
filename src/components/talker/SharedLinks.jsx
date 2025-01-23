import React from "react";
import { Box, Divider, IconButton, Button, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { delSharedLink, delSharedLinkFromSupabase } from "../../features/sharedLinksSlice";

const SharedLinks = ({
  setYourDataOpened,
  openSharedLinks,
  setOpenSharedLinks,
}) => {
  const dispatch = useDispatch();
  // Access sharedLinks state's from Redux Store
  const { sharedLinks, loading, error } = useSelector(
    (state) => state.sharedLinks
  );

  const handleCloseDialog = () => {
    setOpenSharedLinks(false);
    setYourDataOpened(true);
  };

  const handleLinkClick = (linkId) => {
    window.open(`/talker/share/${linkId}`, '_blank');
  };

  const handleSourceChatClick = (conversationId) => {
    window.open(`/talker/c/${conversationId}`, '_blank');
  };

  const handleDeleteSharedLink = (link_id) => {
    // Delete the shared link from reduxState for immediate UI update
    dispatch(delSharedLink({ link_id }));
    // Delete the shared link from the supabaase
    dispatch(delSharedLinkFromSupabase(link_id));
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
                  <IconButton sx={{ color: "#F9F9F9", p: "4px" }}>
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
                        onClick={() => handleSourceChatClick(link.conversation_id)}
                      >
                        <ChatIcon />
                      </IconButton>
                      <IconButton sx={{ color: "#B4B4B4", p: "4px" }} onClick={() => handleDeleteSharedLink(link.link_id_token)}>
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
    </>
  );
};

export default SharedLinks;
