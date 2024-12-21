import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import ReactMarkdown from 'react-markdown';
import { parseTalKerResponse } from '../../scripts/app'
import CodeBox from './CodeBox';

// Styled container for AI messages
const Container = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start', // Align items at the start
  borderRadius: '8px',
  padding: '0px',
  color: 'white',
  paddingInline: '12px',
  paddingBlock: '18px',
  '@media (min-width: 768px)': {
    paddingInline: '20px',
  },
  '@media (min-width: 1024px)': {
    paddingRight: '30px',
  },
});

// Styled logo
const Logo = styled('img')({
  width: '20px',
  height: '20px',
});

const AiMessageContainer = ({ message, isLoading, isNewMessage, setIsTypingEffectFinished, chatContainerRef }) => {
  // Parse the message into interleaved text and code blocks
  const content = parseTalKerResponse(message);

  // State management for typewriterEffect
  const [visibleText, setVisibleText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Immediate rendering for non-new messages
  useEffect(() => {
    if (!isNewMessage) {
      setCurrentContentIndex(content.length); // Render all content
    }
  }, [isNewMessage, content]);

  // typeWriter effect only for newelyGenerated responses
  useEffect(() => {
    if (!isNewMessage || currentContentIndex >= content.length) {
      setIsTypingEffectFinished(true); // Typing complete
      return;
    }

    const currentItem = content[currentContentIndex];
    if (!currentItem) return;

    let typingInterval;

    const typeNextChar = () => {
      if (typingIndex < currentItem.value.length) {
        // Add next character
        setVisibleText((prev) => prev + currentItem.value[typingIndex]);
        setTypingIndex((prev) => prev + 1);
        scrollToBottom();
      } else {
        // Current item fully typed, move to the next item
        clearInterval(typingInterval);
        setTypingIndex(0); // Reset typing index
        setVisibleText(""); // Reset visible text for next item
        setCurrentContentIndex((prev) => prev + 1); // Move to the next content item
      }
    };

    if (isNewMessage) {
      typingInterval = setInterval(typeNextChar, 7); // Typing speed
    }

    return () => clearInterval(typingInterval); // Cleanup
  }, [currentContentIndex, typingIndex, isNewMessage, content]);

  return (
    <Container sx={{ width: '100%' }}>
      {/* Box for the logo */}
      <Box
        sx={{
          padding: '5px',
          border: '1px solid #424242',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: '10px',
          flexShrink: 0,
        }}
      >
        <Logo src={'/talkerLogo.svg'} alt="App Logo" />
      </Box>

      {/* Text container with top margin */}
      <Box
        sx={{
          lineHeight: '28px',
          flex: 1,
          wordBreak: 'break-word',
          marginTop: '-13px',
          width: {
            xs: '88%',
            sm: '80%',
            md: '60%',
            lg: '50%',
            xl: '40%',
          },
          maxWidth: '100%',
          color: '#ECECEC',
        }}
      >
        {isLoading ? (
          <Typography sx={{ color: "#757575", mt: "18px" }}>
            Generating, please wait...
          </Typography>
        ) : (
          content.slice(0, currentContentIndex + 1).map((item, index) => {
            // Current item being typed
            if (index === currentContentIndex && isNewMessage) {
              return item.type === "text" ? (
                <ReactMarkdown key={index}>{visibleText}</ReactMarkdown>
              ) : (
                <CodeBox key={index} language={item.language} code={visibleText} />
              );
            } else {
              // Fully rendered previous items or old messages
              return item.type === "text" ? (
                <ReactMarkdown key={index}>{item.value}</ReactMarkdown>
              ) : (
                <CodeBox key={index} language={item.language} code={item.value} />
              );
            }
          })
        )}
      </Box>
    </Container>
  );
};

export default AiMessageContainer;