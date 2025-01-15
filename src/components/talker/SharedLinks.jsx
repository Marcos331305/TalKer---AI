import React, { useState } from "react";
import { Box, Divider, IconButton, Button, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";

const SharedLinks = ({
  setYourDataOpened,
  openSharedLinks,
  setOpenSharedLinks,
}) => {
  const handleCloseDialog = () => {
    setOpenSharedLinks(false);
    setYourDataOpened(true);
  };
  const sharedLinks = [
    {
      id: 1,
      name: "web development process in brief for beginners",
      dateShared: "January 14, 2025"
    }
  ];
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

          {/* Table Layout */}
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
                <IconButton sx={{ color: "#B4B4B4" }}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Render Rows */}
            {sharedLinks.map((link, index) => (
              <React.Fragment key={link.id}>
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
                    sx={{ flex: 1, color: "#F9F9F9", lineHeight: "20px", 
                      "@media (max-width: 600px)": {
                        pr: 1,
                      },
                     }}
                  >
                    {link.name}
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
                    {link.dateShared}
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
                    <IconButton sx={{ color: "#B4B4B4", p: '4px', pt: '7px'  }}>
                      <ChatIcon />
                    </IconButton>
                    <IconButton sx={{ color: "#B4B4B4", p: '4px' }}>
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
        </Box>
      )}
    </>
  );
};

export default SharedLinks;
