import React, { useState } from 'react'
import Nav from './navbar/Nav'
import MsgInput from './MsgInput'
import ChatArea from './ChatArea'
import { Box } from '@mui/material'
import { useRef } from 'react'
import { useMediaQuery, useTheme } from '@mui/material';
import UiWithDrawer from './UiWithDrawer'

const TalkerUi = () => {
  // stateLifting
  const messageInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const theme = useTheme();
  const is768pxOrLarger = useMediaQuery('(min-width:768px)'); // Check if the screen width is 768px or Larger
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh', // Full height of the viewport
    }}>
      {/* Conditionally render uiWithPersistantDrawer and without it for different screen sizes */}
      {is768pxOrLarger ? (
        <UiWithDrawer isNavigating={isNavigating} setIsNavigating={setIsNavigating} showScrollButton={showScrollButton} setShowScrollButton={setShowScrollButton} messageInputRef={messageInputRef} chatContainerRef={chatContainerRef} />
      ) : (
        <>
          <Nav showScrollButton={showScrollButton} setShowScrollButton={setShowScrollButton} />
          <ChatArea messageInputRef={messageInputRef} chatContainerRef={chatContainerRef} />
          <MsgInput messageInputRef={messageInputRef} chatContainerRef={chatContainerRef} showScrollButton={showScrollButton} setShowScrollButton={setShowScrollButton} />
        </>
      )}
    </Box>
  )
}

export default TalkerUi