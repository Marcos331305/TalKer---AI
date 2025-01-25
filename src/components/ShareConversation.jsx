import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { Typography, Box } from "@mui/material";
import AiMessageContainer from "./talker/AiMessageContainer";
import UserMessageContainer from "./talker/UserMessageContainer";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversationWithMessages } from "../features/conversationsSlice";
import { validateSharedLink } from "../features/yourDataSlice";

const ShareConversation = () => {
  const dispatch = useDispatch();
  const { conversationId: conversationIdAsString, linkToken } = useParams();
  const {
    conversation,
    messages,
    error: fetchError,
  } = useSelector((state) => state.conversations);
  const { error: validationError } = useSelector((state) => state.sharedLinks);

  useEffect(() => {
    const initiateLinkValidation = async () => {
      dispatch(validateSharedLink(linkToken)).then((result) => {
        if (
          result.meta.requestStatus === "fulfilled" &&
          conversationIdAsString
        ) {
          const conversationId = Number(conversationIdAsString);
          dispatch(fetchConversationWithMessages(conversationId));
        }
      });
    };

    initiateLinkValidation();
  }, [linkToken, conversationIdAsString, dispatch]);

  if (validationError || fetchError) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center", // Vertically center content
          alignItems: "center", // Center content horizontally
          minHeight: "100dvh", // Full viewport height
          padding: 4,
        }}
      >
        {/* Content Container */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start", // Align all content to the left inside this container
            textAlign: "left", // Ensure text aligns to the left
            width: "100%", // Make the container full width for responsiveness
            maxWidth: "311px",
          }}
        >
          {/* App Logo */}
          <Box
            component="img"
            src="/talkerLogo.svg" // Replace with the path to your logo
            alt="App Logo"
            sx={{
              width: { xs: "52px", sm: "52px" }, // Responsive logo size
              height: "auto",
              marginBottom: 1,
            }}
          />

          {/* 404 Heading */}
          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#B4B4B4",
              marginBottom: 1,
            }}
          >
            404 - Not Found
          </Typography>

          {/* Short Good Luck Message */}
          <Typography variant="body1" color="text.secondary">
            Oops! This link is no longer available. <br />
            Good luck finding what you're looking for!
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: 2,
        pt: { xs: 2, sm: "40px" },
        maxWidth: 800,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* React Helmet for Dynamic Title */}
      <Helmet>
        <title>
          {conversation ? `TalKerAI - ${conversation.title}` : "TalKerAI"}
        </title>
      </Helmet>

      {/* Conversation heading & creation date */}
      <Box
        sx={{
          borderBottom: "1px solid #ececec",
        }}
      >
        <Typography
          sx={{
            marginBottom: { xs: "12px", sm: "16px" },
            color: "#ececec",
            fontSize: { xs: "30px", sm: "36px" },
            fontWeight: 550,
            lineHeight: "37.5px",
          }}
        >
          {conversation && conversation.title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ marginBottom: { xs: "12px", sm: "16px" }, color: "#B4B4B4" }}
        >
          {conversation &&
            format(new Date(conversation.created_at), "MMMM dd, yyyy")}
        </Typography>
      </Box>

      {/* Messages */}
      <Box sx={{ mx: -2, flexGrow: 1, mb: "52px" }}>
        {messages &&
          messages.map((msg, index) => (
            <Box
              key={msg.id || index}
              sx={{
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start", // Align messages
              }}
            >
              {msg.sender === "user" ? (
                <UserMessageContainer message={msg.content} />
              ) : (
                <AiMessageContainer message={msg.content} />
              )}
            </Box>
          ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          padding: { xs: "8px", lg: "16px" },
          textAlign: "center",
          color: "#B4B4B4",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "#212121",
        }}
      >
        <Typography variant="body2">
          TalKer : Shared Public Conversation Link
        </Typography>
      </Box>
    </Box>
  );
};

export default ShareConversation;
