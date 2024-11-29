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
    const { conversationId: conversationIdAsString } = useParams(); // getting the conversationId from the routeParameters
    const conversationId = conversationIdAsString ? Number(conversationIdAsString) : null;
    const dispatch = useDispatch();
    const messages = useSelector((state) => state.messages.messages);
    const loading = useSelector((state) => state.messages.loading);
    const { conversations = [] } = useSelector((state) => state.conversations || {});
    const [activeConversationTitle, setActiveConversationTitle] = useState('');

    // getting the conversationMessages and title only if the conversationId is available
    useEffect(() => {
        if (conversationId) {
            // Fetch messages for the given conversationId
            dispatch(fetchMessages(conversationId));
        }
    }, []);
    useEffect(() => {
        if (conversationId) {
            // Set active conversation title if conversations are available
            if (Array.isArray(conversations) && conversations.length > 0) {
                const activeConversation = conversations.find(
                    (convo) => convo.conversation_id === conversationId
                );
                if (activeConversation) {
                    setActiveConversationTitle(activeConversation.title);
                }
            }
        } else {
            // Reset the title for a new conversation
            setActiveConversationTitle('TalKerAI');
        }
    }, [conversationId, conversations, dispatch]);

    return (
        <Box ref={chatContainerRef}
            sx={{
                flexGrow: 1,
                overflowY: 'auto', // Enable vertical scrolling
                borderRadius: '8px', // Optional: rounded corners
                position: 'relative',
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
                            <AiMessageContainer message={msg.content} isLoading={loading && msg.sender === 'TalKer' && !msg.content} isNewMessage={msg.isNewMessage} />
                        )}
                    </Box>
                ))
            )}
        </Box>
    );
};

export default ChatArea;
