import React from 'react';
import { Box, Typography } from '@mui/material';

const UserMessageContainer = ({ message }) => {
    return (
        <Box
            sx={{
                backgroundColor: '#2F2F2F',
                borderRadius: '1.5rem',
                padding: '10px 20px',
                color: 'white',
                maxWidth: '70%',
                width: 'fit-content',
                alignSelf: 'flex-end',
                wordWrap: 'break-word',
                marginBlock: '18px',
                marginInline: '12px',
                '@media (min-width: 768px)': {
                    marginInline: '20px',
                },
                '@media (min-width: 1024px)': {
                    marginRight: '35px'
                },
            }}
        >
            <Typography sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#ECECEC',
            }} variant="body1">{message}</Typography>
        </Box>
    );
};


export default UserMessageContainer;
