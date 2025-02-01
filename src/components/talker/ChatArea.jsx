import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Box, Typography } from "@mui/material";
import UserMessageContainer from "./UserMessageContainer";
import AiMessageContainer from "./AiMessageContainer";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchMessages } from "../../features/messageSlice";
import { Helmet } from "react-helmet-async";
import { StateContext } from "../../main";
import { setActiveConversationId } from "../../features/conversationsSlice";

const ChatArea = ({ chatContainerRef }) => {
  const { isTypingEffectFinished, setIsTypingEffectFinished } =
    useContext(StateContext);
  const { conversationId: conversationIdAsString } = useParams();
  const conversationId = conversationIdAsString
    ? Number(conversationIdAsString)
    : null;
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.messages.messages);
  const loading = useSelector((state) => state.messages.loading);
  const { conversations = [] } = useSelector(
    (state) => state.conversations || {}
  );
  const [activeConversationTitle, setActiveConversationTitle] = useState("");
  const autoScrollEnabled = useRef(true);

  // Fetching messages based on conversationId
  useEffect(() => {
    if (conversationId) {
      dispatch(setActiveConversationId(conversationId));
      dispatch(fetchMessages(conversationId));
    }
  }, []);

  // Set active conversation title
  useEffect(() => {
    if (conversationId) {
      const activeConversation = conversations.find(
        (convo) => convo.conversation_id === conversationId
      );
      if (activeConversation) {
        setActiveConversationTitle(activeConversation.title);
      }
    } else {
      setActiveConversationTitle("TalKerAI");
    }
  }, [conversationId, conversations]);

  // Handle scroll events to detect user intervention
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 20;

    // Update auto-scroll flag based on scroll position
    autoScrollEnabled.current = isNearBottom;
  }, []);

  // Setup scroll listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Auto-scroll when new messages are added (user messages or initial AI message)
  useEffect(() => {
    if (!autoScrollEnabled.current) return;

    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "auto",
      });
    }
  }, [messages]); // Trigger when message count changes

  return (
    <Box
      ref={chatContainerRef}
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        borderRadius: "8px", // Optional: rounded corners
        position: "relative",
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: {
          xs: "100%", // Full width for extra small screens
          sm: "100%", // Full width for small screens
          md: "768px", // Max width of 768px for medium and larger screens
        },
        width: "100% !important",
      }}
    >
      {/* React Helmet for Dynamic Title */}
      <Helmet>
        <title>{activeConversationTitle || "TalKerAI"}</title>
      </Helmet>
      {/* Loading View */}
      {/* <Loading loading={loading} message={'Loading Conversation, please wait...'} /> */}
      {/* User Messages & their Responses */}
      {messages.length === 0 ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              mb: 2,
              fontSize: "30px",
              fontWeight: 600,
              color: "#ECECEC",
              paddingInline: "6px",
            }}
            component={"span"}
          >
            What can I help with?
          </Typography>
        </Box>
      ) : (
        messages.map((msg, index) => (
          <Box
            key={msg.id || index}
            sx={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", // Align messages
            }}
          >
            {msg.sender === "user" ? (
              <UserMessageContainer message={msg.content} />
            ) : (
              <AiMessageContainer
                message={msg.content}
                isLoading={loading && msg.sender === "TalKer" && !msg.content}
                isNewMessage={msg.isNewMessage}
                setIsTypingEffectFinished={setIsTypingEffectFinished}
                chatContainerRef={chatContainerRef}
              />
            )}
          </Box>
        ))
      )}
    </Box>
  );
};

export default ChatArea;
