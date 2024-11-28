import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { clearErrors, handleForgotPassword, handleSignup } from '../features/authSlice'

// Material UI Imports
import {
    TextField,
    Button,
    Box,
    Stack,
    Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const isEmail = (email) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authState = useSelector((state) => state.auth);

    //Inputs
    const [emailInput, setEmailInput] = useState('');

    // Inputs Errors
    const [emailError, setEmailError] = useState(false);

    // Overall Form Validity
    const [formValid, setFormValid] = useState();
    const [success, setSuccess] = useState();

    // Simulating an error being set (for demonstration purposes)
    useEffect(() => {
        // Auto-hide form error after 5 seconds
        if (formValid) {
            const timer = setTimeout(() => setFormValid(''), 3000);
            return () => clearTimeout(timer); // Cleanup timer
        }

        // Auto-hide auth error after 5 seconds
        if (authState.error) {
            const timer = setTimeout(() => dispatch(clearErrors()), 3000);
            return () => clearTimeout(timer); // Cleanup timer
        }
    }, [formValid, authState.error]);

    // Validation for onBlur Email
    const handleEmail = () => {
        if (!isEmail(emailInput)) {
            setEmailError(true);
            return;
        }

        setEmailError(false);
    };

    //handle Submittion
    const handleSubmit = async () => {
        setSuccess(null);

        // If Email error is true
        if (emailError || !emailInput) {
            setFormValid("Email is Invalid. Please Re-Enter");
            return;
        }
        setFormValid(null);

        // logic for forgottingPassword
        await dispatch(handleForgotPassword(emailInput));

        setEmailInput('');
    };

    return (
        <Box sx={{
            minHeight: '100dvh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'white',
            flexDirection: 'column',
            gap: {
                xs: '40px',  // Gap for extra-small screens
                sm: '65px',  // Gap for small screens
            },
        }}>
            <Box sx={{
                width: '80px',
            }}>
                <img width={'100%'} src="/talkerLogo.svg" alt="Talker-Logo" />
            </Box>
            <Box sx={{
                padding: 1,
                width: '350px',
                p: 2,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15), 0px 2px 4px rgba(0, 0, 0, 0.1)',
                borderRadius: '7px'
            }}>

                <div style={{ marginTop: "5px" }}>
                    <TextField
                        label="Email Address"
                        fullWidth
                        error={emailError}
                        variant="standard"
                        sx={{ width: "100%" }}
                        value={emailInput}
                        InputProps={{}}
                        size="small"
                        onBlur={handleEmail}
                        onChange={(event) => {
                            setEmailInput(event.target.value);
                        }}
                    />
                </div>

                <div style={{ marginTop: "40px" }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSubmit}
                        sx={{
                            bgcolor: '#009688',
                            color: 'white'
                        }}
                    >
                        continue
                    </Button>
                </div>

                {/* Show Form Error if any */}
                {formValid && (
                    <Stack sx={{ width: "100%", paddingTop: "10px" }} spacing={2}>
                        <Alert severity="error" size="small">
                            {formValid}
                        </Alert>
                    </Stack>
                )}
                {authState.error && (
                    <Stack sx={{ width: "100%", paddingTop: "10px" }} spacing={2}>
                        <Alert severity="error" size="small">
                            {authState.error}
                        </Alert>
                    </Stack>
                )}

                <div style={{ fontSize: "10px", marginTop: "16px" }} margin="left">
                    <p onClick={() => {
                        dispatch(clearErrors())
                        navigate('/')
                    }} style={{ fontSize: '15px', display: 'inline', fontWeight: 400, color: '#009688', cursor: 'pointer' }}>Back to TalkerAI Web</p>
                </div>
            </Box>
        </Box>
    );
}
