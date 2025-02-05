import React from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import { useDispatch } from "react-redux";
import { exportUserData } from "../../features/yourDataSlice";

const BulletPoint = styled("span")({
  display: "inline-block",
  width: "5px",
  height: "5px",
  borderRadius: "50%",
  backgroundColor: "#F9F9F9",
  marginRight: "12px", // Increased spacing
  flexShrink: 0, // Prevent shrinking on small screens
  marginTop: "3px", // Better vertical alignment
});

const ExportDataDialog = ({
  openExportData,
  setOpenExportData,
  setYourDataOpened,
}) => {
  const auth = getAuth();
  const userId = auth.currentUser.uid;
  const dispatch = useDispatch();

  const handleCloseExportDataDialog = () => {
    setOpenExportData(false);
    setYourDataOpened(true);
  };
  const handleConfirmExport = () => {
    toast.success("Exporting your data... The download will start automatically once ready.",{
        position: "top-center",
        theme: "dark",
        style: {
            borderRadius: '8px',
            ...(window.innerWidth > 768 && { minWidth: '450px' }) // Apply only for large screens
        }
    });
    handleCloseExportDataDialog();
    // now handling the exportingData functionality
    dispatch(exportUserData(userId));
  };
  return (
    <>
      {/* ExportData Dialog */}
      {openExportData && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#2F2F2F",
            padding: 2,
            pt: "20px",
            borderRadius: "16px",
            maxWidth: "450px",
            width: "calc(100% - 16px)",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 10000,
          }}
        >
          <Typography
            sx={{
              color: "#F9F9F9",
              fontSize: "18px",
              fontWeight: "600",
              lineHeight: "24px",
            }}
          >
             Data export - are you sure?
          </Typography>
          <Divider sx={{ backgroundColor: "#444444", marginTop: 2 }} />

          {/* Bullet Points */}
          <Box sx={{ marginTop: 2, display: "flex", flexDirection: "column" }}>
            {[
              "Your account details and chats will be included in the export.",
              "Your data is being processed. The download will start automatically once ready.",
              "The export may take a moment, depending on your data size.",
              "Your data will be saved as a ZIP file on your device.",
            ].map((point, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  color: "#F9F9F9",
                  marginTop: 1,
                  width: "100%", // Ensure full width
                }}
              >
                <Box
                  sx={{
                    mt: "3.5px",
                  }}
                >
                  <BulletPoint />
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: "13px", sm: "14px" }, // Responsive font size
                    lineHeight: "20px",
                    flex: 1, // Take remaining space
                  }}
                >
                  {point}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography sx={{ color: "#F9F9F9", marginTop: 2, fontSize: "14px" }}>
            To proceed, click "Confirm export" below.
          </Typography>

          {/* Buttons */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", marginTop: 3 }}
          >
            <Button
              onClick={handleCloseExportDataDialog}
              sx={{
                color: "#F9F9F9",
                borderRadius: "50px",
                border: "1px solid #4E4E4E",
                backgroundColor: "#2F2F2F",
                padding: "8px 20px",
                marginRight: 2,
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmExport}
              sx={{
                color: "#0D0D0D",
                borderRadius: "50px",
                backgroundColor: "#F9F9F9",
                padding: "8px 20px",
                textTransform: "none",
              }}
            >
              Confirm export
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default ExportDataDialog;
