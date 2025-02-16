import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { styled } from "@mui/system";
import ReactMarkdown from "react-markdown";
import { parseTalKerResponse } from "../../scripts/app";
import CodeBox from "./CodeBox";
import systemTheme from "../../scripts/muiTheme";
import { StateContext } from "../../main";
import { useSelector } from "react-redux";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Styled container for AI messages
const Container = styled(Box)({
  display: "flex",
  alignItems: "flex-start", // Align items at the start
  borderRadius: "8px",
  padding: "0px",
  color: "white",
  paddingInline: "12px",
  paddingBlock: "18px",
  "@media (min-width: 768px)": {
    paddingInline: "20px",
  },
  "@media (min-width: 1024px)": {
    paddingRight: "30px",
  },
});

// Styled logo
const Logo = styled("img")({
  width: "20px",
  height: "20px",
});

const AiMessageContainer = ({
  message,
  isLoading,
  isNewMessage,
  chatContainerRef,
}) => {
  const isSearching = useSelector((state) => state.aiFeatures.isSearching);
  // Context for StopIcon while message is being typed
  const {
    isTypingEffectActive,
    setIsTypingEffectActive,
    isTypingEffectFinished,
    setIsTypingEffectFinished,
  } = useContext(StateContext);

  // Parse the message into interleaved text and code blocks
  const content = parseTalKerResponse(message);
  // Use ref for scroll tracking
  const autoScrollEnabled = useRef(true);

  // State management for typewriterEffect
  const [visibleText, setVisibleText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 20;

    autoScrollEnabled.current = isNearBottom;
  }, []);

  // Scroll handler for typewriter effect
  const typewriterScroll = useCallback(() => {
    if (!autoScrollEnabled.current || !chatContainerRef.current) return;

    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth", // Use instant scroll during typing
    });
  }, []);

  // Setup scroll listener
  useEffect(() => {
    const container = chatContainerRef?.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Modified typewriter effect
  useEffect(() => {
    if (!isNewMessage || currentContentIndex >= content.length) {
      setIsTypingEffectFinished(true);
      return;
    }

    const currentItem = content[currentContentIndex];
    if (!currentItem) return;

    let typingInterval;

    const typeNextChar = () => {
      if (typingIndex < currentItem.value.length) {
        setVisibleText((prev) => prev + currentItem.value[typingIndex]);
        setTypingIndex((prev) => prev + 1);
        typewriterScroll(); // Scroll on each character
      } else {
        clearInterval(typingInterval);
        setTypingIndex(0);
        setVisibleText("");
        setCurrentContentIndex((prev) => prev + 1);
      }
    };

    if (isNewMessage) {
      typingInterval = setInterval(typeNextChar, 7);
    }

    return () => clearInterval(typingInterval);
  }, [
    currentContentIndex,
    typingIndex,
    isNewMessage,
    content,
    typewriterScroll,
  ]);

  return (
    <Container sx={{ width: "100%" }}>
      {/* Box for the logo */}
      <Box
        sx={{
          padding: "5px",
          borderStyle: "solid",
          borderWidth: "1px",
          borderColor: systemTheme.palette.customColors.borderColor,
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginRight: "10px",
          flexShrink: 0,
        }}
      >
        <Logo src={"/talkerLogo.svg"} alt="App Logo" />
      </Box>

      {/* Text container with top margin */}
      <Box
        sx={{
          lineHeight: "28px",
          flex: 1,
          wordBreak: "break-word",
          marginTop: "-11.5px",
          width: {
            xs: "88%",
            sm: "80%",
            md: "60%",
            lg: "50%",
            xl: "40%",
          },
          maxWidth: "100%",
          color: systemTheme.palette.text.primary,
        }}
      >
        {isLoading ? (
          <CircularProgress
            sx={{
              color: systemTheme.palette.customColors.generatingWaitColor,
              mt: "18px",
              height: "20px !important",
              width: "20px !important",
              borderRadius: "50%",
              animationDuration: "0.6s",
            }}
          />
        ) : (
          content.slice(0, currentContentIndex + 1).map((item, index) => {
            // Current item being typed
            if (index === currentContentIndex && isNewMessage) {
              return item.type === "text" ? (
                <ReactMarkdown key={index}>{visibleText}</ReactMarkdown>
              ) : (
                <CodeBox
                  key={index}
                  language={item.language}
                  code={visibleText}
                />
              );
            } else {
              // Fully rendered previous items or old messages
              return item.type === "text" ? (
                <ReactMarkdown key={index}>{item.value}</ReactMarkdown>
              ) : (
                <CodeBox
                  key={index}
                  language={item.language}
                  code={item.value}
                />
              );
            }
          })
        )}
      </Box>
    </Container>
  );
};

export default AiMessageContainer;
