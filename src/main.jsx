import './scripts/firebase';
import { StrictMode, useState } from 'react'
import { createContext } from "react"
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@emotion/react'
import { store } from './redux/store.js'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { HelmetProvider } from 'react-helmet-async';
import systemTheme from './scripts/muiTheme.js';
import { lightTheme } from './scripts/muiTheme.js'

export const StateContext = createContext();

const Main = () => {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isTypingEffectActive, setIsTypingEffectActive] = useState(false);
  const [isTypingEffectFinished, setIsTypingEffectFinished] = useState(false);

  return (
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={isLightMode ? lightTheme : systemTheme}>
          <CssBaseline />
          <ToastContainer style={{
            margin: '8px auto',
            padding: '0 8px',
            zIndex: 20000,
          }} />
          <HelmetProvider>
            <StateContext.Provider value={{ isLightMode, setIsLightMode, isTypingEffectActive, setIsTypingEffectActive, isTypingEffectFinished, setIsTypingEffectFinished }}>
              <App />
            </StateContext.Provider>
          </HelmetProvider>
        </ThemeProvider>
      </Provider>
    </StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);