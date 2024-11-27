import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { clearErrors, handleSignup } from '../features/authSlice'

// Material UI Imports
import {
    TextField,
    Button,
    Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const isEmail = (email) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    //Inputs
    const [emailInput, setEmailInput] = useState('');

    // Inputs Errors
    const [usernameError, setUsernameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    // Overall Form Validity
    const [formValid, setFormValid] = useState();
    const [success, setSuccess] = useState();

    // Handles Display and Hide Password
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    // Label for Checkbox
    const label = { inputProps: { "aria-label": "Checkbox demo" } };

    // Validation for onBlur Username
    const handleUsername = () => {
        if (!usernameInput) {
            setUsernameError(true);
            return;
        }

        setUsernameError(false);
    };

    // Validation for onBlur Email
    const handleEmail = () => {
        if (!isEmail(emailInput)) {
            setEmailError(true);
            return;
        }

        setEmailError(false);
    };

    // Validation for onBlur Password
    const handlePassword = () => {
        if (
            !passwordInput ||
            passwordInput.length < 5 ||
            passwordInput.length > 20
        ) {
            setPasswordError(true);
            return;
        }

        setPasswordError(false);
    };

    //handle Submittion
    const handleSubmit = () => {
        setSuccess(null);
        //First of all Check for Errors

        // IF username error is true
        if (usernameError || !usernameInput) {
            setFormValid(
                "Username is set btw 5 - 15 characters long. Please Re-Enter"
            );
            return;
        }

        // If Email error is true
        if (emailError || !emailInput) {
            setFormValid("Email is Invalid. Please Re-Enter");
            return;
        }

        // If Password error is true
        if (passwordError || !passwordInput) {
            setFormValid(
                "Password is set btw 5 - 20 characters long. Please Re-Enter"
            );
            return;
        }
        setFormValid(null);

        // Writing my logic for signUp
        dispatch(handleSignup({ usernameInput, emailInput, passwordInput, rememberMe }));

        if (authState.isAuthenticated) {
            setUsernameInput('');
            setEmailInput('');
            setPasswordInput('');
        }
    };

    const handleLoginClick = () => {
        dispatch(clearErrors());
        navigate('/');
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

                <div style={{ fontSize: "10px", marginTop: "16px" }} margin="left">
                    <p onClick={() => navigate('/')} style={{ fontSize: '15px', display: 'inline', fontWeight: 400, color: '#009688', cursor: 'pointer' }}>Back to TalkerAI Web</p>
                </div>
            </Box>
        </Box>
    );
}
