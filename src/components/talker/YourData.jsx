import React, { useState } from "react";
import {
  Box,
  Divider,
  Backdrop,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Popover,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const YourData = ({ yourDataOpened, setYourDataOpened }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <>
      {/* Backdrop */}
      {yourDataOpened && (
        <Backdrop
          open={yourDataOpened}
          sx={{
            zIndex: 9999, // Ensure the backdrop is behind the settings dialog but above other UI elements
            bgcolor: "rgba(5, 5, 5, 0.7)", // Semi-transparent black background
          }}
        />
      )}

      {/* YourData Dialog */}
      {yourDataOpened && (
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
              YourData
            </Typography>
            <IconButton
              onClick={() => setYourDataOpened(false)}
              sx={{ color: "#FFFFFF" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 2, backgroundColor: "#444444" }} />

          {/* YourData List */}
          <Box>
            {/* Shared Links */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ color: "#FFFFFF" }}>
              Shared links
              </Typography>
              <Button
                variant="outlined"
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
                Manage
              </Button>
            </Box>
            <Divider sx={{ my: 1, backgroundColor: "#444444" }} />

            {/* Export Data */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ color: "#FFFFFF" }}>Export data</Typography>
              <Button
                variant="outlined"
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
                Export
              </Button>
            </Box>
            <Divider sx={{ my: 1, backgroundColor: "#444444" }} />

            {/* Delete Account */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ color: "#FFFFFF" }}>Delete account</Typography>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  borderRadius: "50px",
                  "&:hover": {
                    backgroundColor: "#D83F3F",
                  },
                }}
              >
              Delete
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default YourData;
