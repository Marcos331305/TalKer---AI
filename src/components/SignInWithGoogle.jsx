import React from 'react';
import { Box, Button } from '@mui/material';
import { FcGoogle } from 'react-icons/fc';
import { useDispatch } from 'react-redux';
import { handleSignInWithGoogle } from '../features/authSlice';

const SignInWithGoogle = () => {
    const dispatch = useDispatch();

    const handleGoogleSignIn = () => {
        dispatch(handleSignInWithGoogle({}));
    };

    return (
        <Box sx={{
            mt: '16px',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <Button
                variant="outlined"
                startIcon={<FcGoogle />}
                onClick={handleGoogleSignIn}
                sx={{
                    textTransform: 'none',
                    color: 'text.primary',
                    borderColor: '#009688',
                    '&:hover': { borderColor: '#009688', backgroundColor: 'action.hover' },
                    width: '100%',
                    fontWeight: 400
                }}
            >
                Sign in with Google
            </Button>
        </Box>
    );
};

export default SignInWithGoogle;

