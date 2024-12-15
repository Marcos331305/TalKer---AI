import React, { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import UserMessageContainer from './UserMessageContainer'
import AiMessageContainer from './AiMessageContainer'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchMessages } from '../../features/messageSlice'
import Typewriter from 'typewriter-effect';
import { Helmet } from 'react-helmet-async'

const ChatArea = ({ chatContainerRef }) => {
    const [isTypingEffectFinished, setIsTypingEffectFinished] = useState(false);
    const { conversationId: conversationIdAsString } = useParams();
    const conversationId = conversationIdAsString ? Number(conversationIdAsString) : null;
    const dispatch = useDispatch();
    const messages = useSelector((state) => state.messages.messages);
    const loading = useSelector((state) => state.messages.loading);
    const { conversations = [] } = useSelector((state) => state.conversations || {});
    const [activeConversationTitle, setActiveConversationTitle] = useState('');

    // Fetching messages based on conversationId
    useEffect(() => {
        if (conversationId) {
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
            setActiveConversationTitle('TalKerAI');
        }
    }, [conversationId, conversations]);

    // Reset scroll position to the top whenever the conversation changes
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = 0; // Reset scroll position to the top when conversationId changes
        }
    }, [conversationId]);

    // Handle scroll to bottom whenever the typing effect finishes
    useEffect(() => {
        if (isTypingEffectFinished) {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }
    }, [isTypingEffectFinished]);

    return (
        <Box ref={chatContainerRef}
            sx={{
                flexGrow: 1,
                overflowY: 'auto', // Enable vertical scrolling
                borderRadius: '8px', // Optional: rounded corners
                position: 'relative',
                marginLeft: 'auto',
                marginRight: 'auto',
                maxWidth: {
                    xs: '100%',    // Full width for extra small screens
                    sm: '100%',    // Full width for small screens
                    md: '768px',   // Max width of 768px for medium and larger screens
                },
                width: '100% !important',  // Ensures the Box is 100% width within the maxWidth constraint
                '&::-webkit-scrollbar': {
                    width: '6px', // Adjust width of the scrollbar
                },
                '&::-webkit-scrollbar-track': {
                    background: '#212121', // Ensure track background matches container
                    borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#424242', // Scroll thumb color
                    borderRadius: '10px',
                    '&:hover': {
                        backgroundColor: '#676767', // Hover effect
                    },
                },
                '&:hover::-webkit-scrollbar-thumb': {
                    backgroundColor: '#676767', // Scroll thumb color on hover
                },
            }}
        >
            {/* React Helmet for Dynamic Title */}
            <Helmet>
                <title>{activeConversationTitle || 'TalKerAI'}</title>
            </Helmet>
            {/* Loading View */}
            {/* <Loading loading={loading} message={'Loading Conversation, please wait...'} /> */}
            {/* User Messages & their Responses */}
            {messages.length === 0 ? (
                <Box sx={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <Typography sx={{
                        mb: 2,
                        fontSize: '30px',
                        fontWeight: 600,
                        color: 'white'
                    }} component={'span'}>
                        <Typewriter
                            options={{
                                strings: ['What can I help with?'],  // The text to type
                                autoStart: true,  // Automatically start the typewriter effect
                                loop: true,  // Continuously loop the typewriting and deleting effect
                                delay: 100,  // Speed of typing
                                deleteSpeed: 140,  // Speed of deleting
                                cursorColor: 'white',  // Cursor color
                            }}
                        />
                    </Typography>
                </Box>
            ) : (
                messages.map((msg, index) => (
                    <Box
                        key={msg.id || index}
                        sx={{
                            display: 'flex',
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', // Align messages
                        }}
                    >
                        {msg.sender === 'user' ? (
                            <UserMessageContainer message={msg.content} />
                        ) : (
                            <AiMessageContainer message={msg.content} isLoading={loading && msg.sender === 'TalKer' && !msg.content} isNewMessage={msg.isNewMessage} setIsTypingEffectFinished={setIsTypingEffectFinished} chatContainerRef={chatContainerRef} />
                        )}
                    </Box>
                ))
            )}
        </Box>
    );
};

export default ChatArea;
