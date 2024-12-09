import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import ReactMarkdown from 'react-markdown';
import { parseTalKerResponse } from '../../scripts/app'
import CodeBox from './CodeBox';
import { useSelector } from 'react-redux';
import AiErrorContainer from './AiErrorContainer';

// Styled container for AI messages
const Container = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start', // Align items at the start
  borderRadius: '8px',
  padding: '0px',
  color: 'white',
  paddingInline: '12px',
  paddingBlock: '18px'
});

// Styled logo
const Logo = styled('img')({
  width: '20px',
  height: '20px',
});

const AiMessageContainer = ({ message, isLoading, isNewMessage, setIsTypingEffectFinished, chatContainerRef }) => {
  // talkerResponseGeneration error
  const talkerRespoError = useSelector((state) => state.messages.error);

  // Parse the message into interleaved text and code blocks
  const content = parseTalKerResponse(message);

  // State management for typewriterEffect
  const [visibleText, setVisibleText] = useState(''); 
  const [typingIndex, setTypingIndex] = useState(0); 

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // typeWriter effect only for newelyGenerated responses
  useEffect(() => {
    // If it's a new message and hasn't been typed yet, apply typewriter effect
    if (isNewMessage) {
      const fullText = content
        .filter((item) => item.type === 'text')
        .map((item) => item.value)
        .join('\n'); // Combine all text blocks

      let typingInterval;

      const typeNextChar = () => {
        if (typingIndex < fullText.length) {
          setVisibleText((prev) => prev + fullText[typingIndex]);
          setTypingIndex((prev) => prev + 1);
          scrollToBottom(); // Scroll as the text is typed
        } else {
          clearInterval(typingInterval); // Stop typing
          setIsTypingEffectFinished(true); // Mark typing effect as finished
        }
      };

      typingInterval = setInterval(typeNextChar, 50); // Adjust speed (50ms per character)

      return () => clearInterval(typingInterval); // Cleanup on unmount or loading state change
    } else {
      // Show the full content immediately for non-new or already typed messages
      const fullText = content
        .filter((item) => item.type === 'text')
        .map((item) => item.value)
        .join('\n');
      setVisibleText(fullText);
    }
  }, [isNewMessage, isLoading, typingIndex, content]);

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
        }}
      >
         {isLoading ? (
          <Typography sx={{ color: "#757575", mt: "18px" }}>
            Generating, please wait...
          </Typography>
        ) : (
          <>
            {content.map((item, index) =>
              item.type === 'text' ? (
                <ReactMarkdown key={index}>{visibleText}</ReactMarkdown>
              ) : (
                <CodeBox
                  key={index}
                  language={item.language}
                  code={item.value}
                />
              )
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default AiMessageContainer;