import React from "react";
import { Box, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ErrorComponent = ({ message }) => {
  return (
    <Box
      sx={{
        border: "1px solid #4B2627",
        backgroundColor: "#2D2322",
        padding: "16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        borderRadius: "1rem",
        maxWidth: "100%",
        wordBreak: "break-word",
        mt: '2rem'
      }}
    >
      {/* Error Icon */}
      <ErrorOutlineIcon
        sx={{
          color: "#F93A37",
          fontSize: "24px",
          flexShrink: 0, // Prevent shrinking when space is tight
        }}
      />

      {/* Error Message */}
      <Typography
        sx={{
          color: "#ECECEC",
          fontSize: "16px",
          lineHeight: "28px",
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default ErrorComponent;
