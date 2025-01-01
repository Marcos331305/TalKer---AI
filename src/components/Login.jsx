import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { clearErrors, handleLogin } from '../features/authSlice'
import Loading from "./Loading";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
  Box,
  Typography,
} from "@mui/material";

// Material UI Icon Imports
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import { useNavigate } from "react-router-dom";
import SignInWithGoogle from "./SignInWithGoogle";
import { Helmet } from 'react-helmet-async';

// Email Validation
const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const loading = authState.loading;
  const [showPassword, setShowPassword] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Checking for user session for automatic login
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (userCred) => {
      if (userCred && userCred.emailVerified) {
        // User is signed in and email is verified; navigate to protected route
        navigate('/talker', { replace: true });
      }
      // If user is signed in but email is not verified, do nothing
      setLoadingSession(false); // End loading state to render login UI
    });

    return unsubscribe;
  }, [navigate]);

  // Navigate the user to their appropriate ui after login
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/talker', { replace: true });
    }
  }, [authState.isAuthenticated, navigate]);

  //Inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Inputs Errors
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Overall Form Validity
  const [formValid, setFormValid] = useState();
  const [success, setSuccess] = useState();

  // Simulating an error being set (for demonstration purposes)
  useEffect(() => {
    // Auto-hide form error after 3 seconds
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
    //First of all Check for Errors

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

    // writing my dispatch for userLogin
    dispatch(handleLogin({ emailInput, passwordInput, rememberMe }));
  };

  const handleSignupClick = () => {
    dispatch(clearErrors());
    navigate('/signUp');
  };

  if (loadingSession) {
    return <Loading message="Checking session, please wait..." />; // Display loading while checking session
  }

  const handleForgotPassClick = () => {
    dispatch(clearErrors());
    navigate('/forgotPassword');
  };

  return (
    <Box sx={{
      height: '100dvh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      bgcolor: 'white',
      gap: {
        xs: '30px',  // Gap for extra-small screens
        sm: '55px',  // Gap for small screens
      },
    }}>
      {/* React Helmet for Dynamic Title */}
      <Helmet>
        <title>Login - TalKerAI</title>
      </Helmet>

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
        borderRadius: '7px',
      }}>
        {/* LoadingView */}
        <Loading loading={loading} message={'Logging in, please wait...'} />
        <div style={{ color: '#555555' }}>
          <TextField
            label="Email Address"
            fullWidth
            error={emailError}
            id="standard-basic"
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
              Password
            </InputLabel>
            <Input
              sx={{
                color: '#555555'
              }}
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
            />
          </FormControl>
        </div>

        <div style={{ fontSize: "15px", display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          <label
            htmlFor="rememberMe-checkbox"
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent', // Removes tap highlight color on mobile devices
              fontWeight: 400
            }}
          >
            <Checkbox
              id="rememberMe-checkbox"
              {...label}
              size="medium"
              onChange={(event) => setRememberMe(event.target.checked)}
              disableRipple // Removes ripple effect
              sx={{
                '&.Mui-checked': { color: '#009688' },
                '&:hover': { backgroundColor: 'transparent' }, // Removes hover background
                '&:active': { backgroundColor: 'transparent' }, // Removes active background
                '&:focus-visible': { outline: 'none' }, // Removes focus outline
                '&.MuiTouchRipple-root': { display: 'none' }, // Ensures ripple is disabled
              }}
            />
            <Typography sx={{
              color: '#555555'
            }}>
              Remember Me
            </Typography>
          </label>
        </div>

        <div style={{ marginTop: "10px" }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<LoginIcon color="#fff" />}
            onClick={handleSubmit}
            sx={{
              bgcolor: '#009688',
              color: 'white'
            }}
          >
            LOGIN
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

        <div style={{ marginTop: "16px", fontSize: "10px" }} margin="left">
          <a onClick={handleForgotPassClick} style={{ fontSize: '14px', color: '#009688', cursor: 'pointer' }}>Forgot password?</a>
          <br />
          <p style={{ display: 'inline', fontSize: '14px', fontWeight: 400, color: '#555555' }}>New user?{" "}</p>
          <small onClick={handleSignupClick} style={{ color: "#009688", cursor: 'pointer', fontSize: '14px', display: 'inline', fontWeight: 400 }}>
            Register Here
          </small>
        </div>

        {/* signInWithGoogle */}
        <SignInWithGoogle />
      </Box>
    </Box>
  );
}
