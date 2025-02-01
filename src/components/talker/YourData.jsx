import React, { useState } from "react";
import {
  Box,
  Divider,
  Backdrop,
  IconButton,
  Button,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SharedLinks from "./SharedLinks";
import ExportDataDialog from "./ExportDataDialog";

const YourData = ({ yourDataOpened, setYourDataOpened }) => {
const [openSharedLinks, setOpenSharedLinks] = useState(false); // State to control dialog visibility of sharedLinks
const [openExportData, setOpenExportData] = useState(false); // State to control dialog visibility of exportData

const handleOpenSharedLinksDialog = () => {
setYourDataOpened(false);
setOpenSharedLinks(true);
};
const handleOpenExportDataDialog = () => {
setYourDataOpened(false);
setOpenExportData(true);
};
  return (
    <>
      {/* Backdrop */}
      {(yourDataOpened || openSharedLinks || openExportData) && (
        <Backdrop
          open={yourDataOpened || openSharedLinks || openExportData}
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
            width: 'calc(100% - 16px)',
            marginRight: '8px',
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
              <Button onClick={handleOpenSharedLinksDialog}
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
              <Button onClick={handleOpenExportDataDialog}
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

      {/* Rendering of yourDataMenu components */}
    <SharedLinks openSharedLinks={openSharedLinks} setOpenSharedLinks={setOpenSharedLinks} setYourDataOpened={setYourDataOpened} />
    <ExportDataDialog openExportData={openExportData} setOpenExportData={setOpenExportData} setYourDataOpened={setYourDataOpened} />
    </>
  );
};

export default YourData;
