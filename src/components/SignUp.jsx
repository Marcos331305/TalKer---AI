import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { clearErrors, handleSignup } from '../features/authSlice'
import Loading from "./Loading.jsx";

// Material UI Imports
import {
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  IconButton,
  Button,
  Input,
  Checkbox,
  Alert,
  Stack,
  Box
} from "@mui/material";

// Material UI Icon Imports
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';

// Validations

// Email Validation
const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth);
  const loading = authState.loading;
  const [showPassword, setShowPassword] = React.useState(false);

  //Inputs
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Inputs Errors
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

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
      {/* React Helmet for Dynamic Title */}
      <Helmet>
        <title>Register - TalKerAI</title>
      </Helmet>

      {/* LoadingView */}
      <Loading loading={loading} message={'Registering, please wait...'} />
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
        <div style={{ marginTop: "10px" }}>
          <TextField
            error={usernameError}
            label="Username"
            variant="standard"
            size="small"
            value={usernameInput}
            InputProps={{}}
            onChange={(event) => {
              setUsernameInput(event.target.value);
            }}
            onBlur={handleUsername}
            sx={{
              width: "100%",
              '& .MuiInputBase-input': {
                color: '#555555', // Apply the text color here
              }
            }}
          />
        </div>

        <div style={{ marginTop: "5px" }}>
          <TextField
            label="Email Address"
            fullWidth
            error={emailError}
            variant="standard"
            value={emailInput}
            InputProps={{}}
            size="small"
            onBlur={handleEmail}
            onChange={(event) => {
              setEmailInput(event.target.value);
            }}
            sx={{
              width: "100%",
              '& .MuiInputBase-input': {
                color: '#555555', // Apply the text color here
              }
            }}
          />
        </div>
        <div style={{ marginTop: "5px" }}>
          <FormControl sx={{ width: "100%" }} variant="standard">
            <InputLabel
              error={passwordError}
              htmlFor="standard-adornment-password"
            >
              Create a password
            </InputLabel>
            <Input
              error={passwordError}
              onBlur={handlePassword}
              id="standard-adornment-password"
              type={showPassword ? "text" : "password"}
              onChange={(event) => {
                setPasswordInput(event.target.value);
              }}
              value={passwordInput}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              sx={{
                color: '#555555', // Apply the text color here
              }}
            />
          </FormControl>
        </div>

        <div style={{ marginTop: "40px" }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<LoginIcon />}
            onClick={handleSubmit}
            sx={{
              bgcolor: '#009688',
              color: 'white'
            }}
          >
            Register
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
          <p style={{ fontSize: '14px', display: 'inline', fontWeight: 400, color: '#555555' }}>Do you have an account?{" "}</p>
          <small onClick={handleLoginClick} style={{ color: "#009688", fontSize: '14px', cursor: 'pointer' }}>
            Login
          </small>
        </div>
      </Box>
    </Box>
  );
}
