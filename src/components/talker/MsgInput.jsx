import React, { useState, useEffect, useRef, useContext } from "react";
import {
  InputBase,
  IconButton,
  Typography,
  Box,
  Collapse,
  Button,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useSelector, useDispatch } from "react-redux";
import {
  addMsg,
  storeMsgInSupabase,
  talkerResponse,
  updateIsNewMessage,
} from "../../features/messageSlice";
import {
  addConversation,
  createConversationInSupabase,
  fetchConversations,
  generateConversationTitle,
  setActiveConversationId,
  setActiveIndex,
} from "../../features/conversationsSlice";
import { generateUniqueId } from "../../scripts/app";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StopIcon from "@mui/icons-material/Stop";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import systemTheme from "../../scripts/muiTheme";
import { StateContext } from "../../main";
import { fetchSharedLinksFromSupabase } from "../../features/yourDataSlice";
import { Language } from "@mui/icons-material";
import {
  handleWebSearch,
  setIsSearching,
} from "../../features/aiFeaturesSlice";

const MsgInput = ({
  messageInputRef,
  chatContainerRef,
  showScrollButton,
  setShowScrollButton,
  isNavigating,
}) => {
  // StateContext for stopGeneratingResponseButton
  const { isTypingEffectActive, setIsTypingEffectActive } =
    useContext(StateContext);
  const isSearching = useSelector((state) => state.aiFeatures.isSearching);
  const [isRecording, setIsRecording] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const recognitionRef = useRef(null); // Store recognition instance in ref
  const [accumulatedTranscript, setAccumulatedTranscript] = useState(""); // For storing the ongoing transcript
  const [speechApiSupported, setSpeechApiSupported] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [lastRecordedTime, setLastRecordedTime] = useState("00:00");
  const [timerId, setTimerId] = useState(null); // Store interval ID
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [scrollButtonPosition, setScrollButtonPosition] = useState("-55px");
  const activeConversationId = useSelector(
    (state) => state.conversations.activeConversationId
  );
  const conversations = useSelector(
    (state) => state.conversations.conversations
  );
  const messages = useSelector((state) => state.messages.messages);
  // Initialize the Firebase Auth instance
  const auth = getAuth();
  // Get the current user
  const user = auth.currentUser;

  // fetch conversation when the app Loads
  useEffect(() => {
    // Fetch conversations on the app Level
    dispatch(fetchConversations(user.uid));

    // Fetch sharedLink on the app Level
    dispatch(fetchSharedLinksFromSupabase({ userId: user.uid }));

    // Check if this is the first app load
    const isFirstLoad = sessionStorage.getItem("isFirstLoad") === null;

    if (isFirstLoad) {
      // Prevent auto-selection of activeConversationId on first load
      sessionStorage.setItem("isFirstLoad", "false");
      dispatch(setActiveConversationId(null));
    } else {
      // Retrieve stored active conversation from sessionStorage for subsequent loads
      const storedData = sessionStorage.getItem("activeConversationId");

      if (storedData) {
        try {
          const activeConversationId = JSON.parse(storedData);
          dispatch(setActiveConversationId(activeConversationId));
        } catch (error) {
          console.error(
            "Error parsing activeConversationId from sessionStorage:",
            error
          );
        }
      }
    }
  }, []);

  // handle Msg sending btn
  // 1. handle Direct Messaging
  const handleSend = async () => {
    const userMessage = {
      id: generateUniqueId(),
      content: message,
      sender: "user",
    };

    // Add user message to Redux state for immediate UI update
    dispatch(addMsg(userMessage));
    setMessage(""); // Clear the input field

    // Adding talkerMessage immediately for better exprience
    const talkerMsg = {
      id: generateUniqueId(),
      content: "",
      sender: "TalKer",
      isNewMessage: true, // for happening typewriterEffect only once
    };
    dispatch(addMsg(talkerMsg));

    // Generate Talker response
    let talkerResponseContent = "";
    try {
      const talkerResponseObj = await dispatch(
        talkerResponse({
          prompt: userMessage.content,
          dummyMsgId: talkerMsg.id,
        })
      ).unwrap();

      // Explicitly throwing the erro if apiResponse is ok, But actual talkerResponse is missing
      if (!talkerResponseObj || !talkerResponseObj.talkerResponse) {
        throw new Error("TalkerAPI failed to generate Response !!!");
      }

      talkerResponseContent = talkerResponseObj.talkerResponse;
    } catch (error) {
      // If Talker response fails, provide an error message
      talkerResponseContent =
        "Oops, something went wrong. Please try again or try with a different Prompt";
    }

    // Update Talker message with final content
    const updatedTalkerMsg = { ...talkerMsg, content: talkerResponseContent };

    if (!activeConversationId) {
      // Generate a conversation title
      const response = await dispatch(
        generateConversationTitle(userMessage.content)
      );
      const conversationTitle = response.payload;
      const now = new Date();
      const conversation = {
        conversation_id: generateUniqueId(),
        user_id: user.uid,
        title: conversationTitle,
        created_at: now.toISOString(),
      };

      // Add new conversation to Redux state
      dispatch(addConversation(conversation));
      dispatch(setActiveConversationId(conversation.conversation_id)); // Ensure the conversation is active

      // Short delay to allow the sidebar to recognize the new active conversation
      setTimeout(() => {
        dispatch(setActiveIndex(conversations.length)); // Last item index
        navigate(`/talker/c/${conversation.conversation_id}`);
      }, 50); // 50ms delay to ensure state and UI sync

      // Save the new conversation and messages to Supabase
      await dispatch(createConversationInSupabase(conversation));
      dispatch(
        storeMsgInSupabase({
          msg: userMessage,
          conversation_id: conversation.conversation_id,
        })
      );
      await dispatch(
        storeMsgInSupabase({
          msg: updatedTalkerMsg,
          conversation_id: conversation.conversation_id,
        })
      );
      dispatch(updateIsNewMessage({ messageId: talkerMsg.id }));
    } else {
      dispatch(
        storeMsgInSupabase({
          msg: userMessage,
          conversation_id: activeConversationId,
        })
      );
      await dispatch(
        storeMsgInSupabase({
          msg: updatedTalkerMsg,
          conversation_id: activeConversationId,
        })
      );
      dispatch(updateIsNewMessage({ messageId: talkerMsg.id }));
    }
  };
  // 2. handle webSearching
  const handleWebSearching = async () => {
    const userMessage = {
      id: generateUniqueId(),
      content: message,
      sender: "user",
    };

    // Add user message to Redux state for immediate UI update
    dispatch(addMsg(userMessage));
    setMessage(""); // Clear the input field

    // Adding talkerMessage immediately for better exprience
    const talkerMsg = {
      id: generateUniqueId(),
      content: "",
      sender: "TalKer",
      isNewMessage: true, // for happening typewriterEffect only once
    };
    dispatch(addMsg(talkerMsg));

    // Generate Talker response
    let talkerResponseContent = "";
    try {
      const actualPrompt = await dispatch(
        handleWebSearch({
          query: userMessage.content,
          dummyMsgId: talkerMsg.id,
        })
      ).unwrap();

      const talkerResponseObj = await dispatch(
        talkerResponse({
          prompt: actualPrompt,
          dummyMsgId: talkerMsg.id,
        })
      ).unwrap();

      // Explicitly throwing the error if apiResponse is ok, But actual talkerResponse is missing
      if (!talkerResponseObj || !talkerResponseObj.talkerResponse) {
        throw new Error("TalkerAPI failed to generate Response !!!");
      }

      talkerResponseContent = talkerResponseObj.talkerResponse;
    } catch (error) {
      // If Talker response fails, provide an error message
      talkerResponseContent =
        "Oops, something went wrong. Please try again or try with a different Prompt";
    }

    // Update Talker message with final content
    const updatedTalkerMsg = { ...talkerMsg, content: talkerResponseContent };

    if (!activeConversationId) {
      // Generate a conversation title
      const response = await dispatch(
        generateConversationTitle(userMessage.content)
      );
      const conversationTitle = response.payload;
      const now = new Date();
      const conversation = {
        conversation_id: generateUniqueId(),
        user_id: user.uid,
        title: conversationTitle,
        created_at: now.toISOString(),
      };

      // Add new conversation to Redux state
      dispatch(addConversation(conversation));
      dispatch(setActiveConversationId(conversation.conversation_id)); // Ensure the conversation is active

      // Short delay to allow the sidebar to recognize the new active conversation
      setTimeout(() => {
        dispatch(setActiveIndex(conversations.length)); // Last item index
        navigate(`/talker/c/${conversation.conversation_id}`);
      }, 50); // 50ms delay to ensure state and UI sync

      // Save the new conversation and messages to Supabase
      await dispatch(createConversationInSupabase(conversation));
      dispatch(
        storeMsgInSupabase({
          msg: userMessage,
          conversation_id: conversation.conversation_id,
        })
      );
      await dispatch(
        storeMsgInSupabase({
          msg: updatedTalkerMsg,
          conversation_id: conversation.conversation_id,
        })
      );
      dispatch(updateIsNewMessage({ messageId: talkerMsg.id }));
    } else {
      dispatch(
        storeMsgInSupabase({
          msg: userMessage,
          conversation_id: activeConversationId,
        })
      );
      await dispatch(
        storeMsgInSupabase({
          msg: updatedTalkerMsg,
          conversation_id: activeConversationId,
        })
      );
      dispatch(updateIsNewMessage({ messageId: talkerMsg.id }));
    }
  };

  // Handling Scrolling of chatArea
  const scrollToBottom = () => {
    setShowScrollButton(false);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "auto",
      });
    }
  };
  useEffect(() => {
    setShowScrollButton(false); // Hide the scroll button by default

    const chatContainer = chatContainerRef.current;

    const handleScroll = () => {
      if (chatContainer) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainer;
        // Use media query to determine the threshold based on screen width
        const threshold = window.innerWidth >= 768 ? 100 : 70;
        setShowScrollButton(
          scrollHeight - scrollTop - clientHeight > threshold
        );

        // Check if the user is at the bottom
        if (scrollHeight - scrollTop === clientHeight) {
          setIsAtBottom(true);
        } else {
          setIsAtBottom(false);
        }
      }
    };

    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }

    // Dynamically adjust button position based on input height
    const resizeObserver = new ResizeObserver(() => {
      if (messageInputRef.current) {
        const inputFieldHeight = messageInputRef.current.scrollHeight;
        const buttonPosition = inputFieldHeight > 100 ? "-48px" : "-48px"; // Adjust as needed
        setScrollButtonPosition(buttonPosition);
      }
    });

    if (messageInputRef.current) {
      resizeObserver.observe(messageInputRef.current); // Observe input height changes
    }

    // Cleanup functions for scroll event listener
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
      if (messageInputRef.current) {
        resizeObserver.unobserve(messageInputRef.current); // Clean up observer
      }
    };
  }, [messages, isNavigating, activeConversationId, isAtBottom]);

  // Handling voiceInput functionality
  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };

  const startTimer = () => {
    setStartTime(Date.now());
    setCurrentTime(Date.now()); // Initialize to prevent negative values

    const id = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    setTimerId(id); // Save the interval ID
    setLastRecordedTime("00:00"); // Reset only when starting a new recording
  };

  const stopTimer = () => {
    if (timerId) {
      clearInterval(timerId); // Stop the interval
      setTimerId(null);
    }

    if (startTime) {
      // Calculate elapsed time when stopping the timer
      const diffInSeconds = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      setLastRecordedTime(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`
      );
    }

    setStartTime(null); // Reset start time
    setCurrentTime(null); // Reset current time
  };

  const getElapsedTime = () => {
    if (timerId) {
      // Timer is running, calculate elapsed time
      if (!startTime || !currentTime) return "00:00";
      const diffInSeconds = Math.floor((currentTime - startTime) / 1000);
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    } else {
      // Timer is stopped, show the last recorded time
      return lastRecordedTime;
    }
  };

  // speechRecognition using webSpeech api
  // Initialize the recognition instance when the component is mounted
  useEffect(() => {
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      alert("Speech Recognition not supported in this browser.");
    } else {
      setSpeechApiSupported(true);
      recognitionRef.current = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      const recognition = recognitionRef.current;
      recognition.lang = "en-US";
      recognition.continuous = true; // Keeps listening until stopped
      recognition.interimResults = true; // Show interim results

      // Handle speech recognition results
      recognition.onresult = (event) => {
        let interimTranscript = ""; // Store interim results temporarily
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setAccumulatedTranscript((prev) => prev + " " + transcript.trim());
          } else {
            interimTranscript += transcript; // Append interim result
          }
        }
      };

      // Handle errors
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event);
      };
    }
  }, []);
  // Start speech recognition
  const startRecognition = () => {
    const recognition = recognitionRef.current;
    if (recognition && speechApiSupported) {
      recognitionRef.current.start();
      setAccumulatedTranscript(""); // Clear previous transcript
    }
  };

  // Stop speech recognition
  const stopRecognition = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setMessage(accumulatedTranscript.trim());
    }
  };

  // Stop generating response
  const handleStopGeneratingResponse = () => {
    console.log("Stop generating response");
  };

  return (
    <Box
      sx={{
        maxWidth: {
          xs: "100%",
          md: "744px",
        },
        width: "100%",
        mx: "auto",
        position: "relative",
      }}
    >
      {/* scrollDown button */}
      {showScrollButton && (
        <IconButton
          onClick={scrollToBottom}
          sx={{
            position: "absolute", // Positioned relative to chatArea
            right: "20px",
            top: scrollButtonPosition,
            backgroundColor: "#212121",
            color: "white",
            borderRadius: "50%",
            border: "1px solid #383737",
            width: 32,
            height: 32,
            zIndex: 1000,
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            "&:hover": {
              backgroundColor: "#333333",
            },
          }}
        >
          <ExpandMoreIcon fontSize="medium" />
        </IconButton>
      )}

      {/* InputField and Icon's Container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: systemTheme.palette.secondary.main,
          borderRadius: "1.5rem",
          px: "10px",
          py: "4px",
          mx: "12px",
          "@media (min-width: 768px)": {
            mx: "20px", // Custom margin for exactly 768px and above
          },
        }}
      >
        {/* Input Field container */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            px: "8px",
            py: "6px",
          }}
        >
          <InputBase
            ref={messageInputRef}
            name="Message-Input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isRecording && speechApiSupported
                ? "Listening..."
                : "Message TalKer"
            }
            multiline
            minRows={1} // Minimum rows for input
            maxRows={7} // Maximum rows for input
            sx={{
              flex: 1, // Allow input to take all available space
              fontSize: "16px",
              color: systemTheme.palette.text.primary,
              borderRadius: "8px",
              "& .MuiInputBase-input": {
                border: "none",
                outline: "none",
                overflowY: "auto", // Enable vertical scrolling for overflow content
                wordBreak: "break-word", // Wrap long words
                whiteSpace: "pre-wrap", // Preserve white space and new lines
                height: "auto", // Automatically adjust height
              },
            }}
          />
        </Box>
        {/* Icon's Container */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            py: "6px",
            alignItems: "center",
          }}
        >
          {/* webSearch Icon */}
          <Button
            disableRipple
            onClick={() => dispatch(setIsSearching(!isSearching))}
            sx={{
              color: systemTheme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start", // Align content to the left when not searching
              gap: "4px",
              textTransform: "none",
              fontSize: "16px",
              borderRadius: "25px",
              p: 0,
              pl: "5px",
              ":hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <Language
              fontSize="medium"
              sx={{
                verticalAlign: "middle",
                color: isSearching && "#48AAFF",
              }}
            />
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 500,
                color: isSearching && "#48AAFF",
              }}
            >
              Search
            </Typography>
            {/* Only show the text when searching */}
          </Button>
          {/* microphone and sendBtn container */}
          <Box
            sx={{
              display: "flex",
              gap: "4px",
              alignItems: "center",
            }}
          >
            {/* microphoneIcon */}
            <IconButton
              onClick={() => {
                if (speechApiSupported) {
                  toggleRecording(); // Toggling the recording state
                  if (!isRecording) {
                    startTimer(); // Start the timer only if recording is about to begin
                    startRecognition();
                  } else {
                    stopTimer(); // Stop the timer when recording ends
                    stopRecognition();
                  }
                }
                if (speechApiSupported === false) {
                  toggleRecording();
                }
              }}
              sx={{
                color: systemTheme.palette.primary.main,
                padding: "4px",
                display: message.trim() ? "none" : "flex",
              }}
            >
              {isRecording ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            {/* Send Button or StopBtn */}
            {/* {isTypingEffectActive ?
              <IconButton
                onClick={handleStopGeneratingResponse}
                sx={{
                  backgroundColor: systemTheme.palette.customColors.customColor,
                  borderRadius: '50%', // Fully rounded button
                  padding: '4px',
                }}
              >
                <StopIcon
                  sx={{
                    color: '#000000',
                    '&:hover': {
                    backgroundColor: systemTheme.palette.customColors.customColor,
                  },
                  }}
                /> */}
            {/* </IconButton> : */}
            <IconButton
              onClick={() => {
                if (isSearching) handleWebSearching();
                else handleSend();
              }}
              disabled={!message.trim()}
              sx={{
                backgroundColor: !message.trim()
                  ? `${systemTheme.palette.customColors.customColor4} !important`
                  : systemTheme.palette.customColors.customColor,
                borderRadius: "50%", // Fully rounded button
                padding: "4px",
                "&:hover": {
                  backgroundColor: !message.trim()
                    ? `${systemTheme.palette.customColors.customColor4} !important`
                    : systemTheme.palette.customColors.customColor,
                },
              }}
            >
              <KeyboardArrowUpIcon
                sx={{
                  color: !message.trim()
                    ? systemTheme.palette.customColors.customColor3
                    : systemTheme.palette.customColors.customColor2,
                }}
              />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Recording UI with Sliding Animation */}
      <Collapse in={isRecording} timeout={300}>
        <Box
          sx={{
            backgroundColor: "#2F2F2F",
            borderRadius: "8px",
            mt: "12px",
            p: 2,
            mx: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            height: "150px", // Fixed height for the recording UI
          }}
        >
          {speechApiSupported ? (
            <>
              {/* Timer */}
              <Typography
                sx={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  color: systemTheme.palette.primary.main,
                  fontSize: "14px",
                }}
              >
                {getElapsedTime()}
              </Typography>

              {/* Stop Recording */}
              <IconButton
                onClick={() => {
                  stopTimer();
                  stopRecognition();
                }}
                sx={{
                  color: systemTheme.palette.primary.main,
                  borderRadius: "50%",
                  mb: 2,
                  border: "1px solid #B4B4B4",
                }}
              >
                <StopIcon />
              </IconButton>

              {/* Text */}
              <Typography
                sx={{
                  color: systemTheme.palette.primary.main,
                  fontSize: "16px",
                }}
              >
                Tap to stop recording
              </Typography>
            </>
          ) : (
            <Typography
              sx={{
                color: systemTheme.palette.primary.main,
                fontSize: "16px",
                textAlign: "center",
              }}
            >
              Sorry, webSpeech is not supported in your browser!
            </Typography>
          )}
        </Box>
      </Collapse>

      {/* Disclaimer message */}
      <Typography
        Typography
        variant="body2"
        sx={{
          padding: "8px",
          textAlign: "center",
          fontSize: "12px",
          color: systemTheme.palette.text.secondary,
        }}
      >
        TalKer can make mistakes.Check important info.
      </Typography>
    </Box>
  );
};

export default MsgInput;
