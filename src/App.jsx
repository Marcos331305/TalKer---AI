import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx'
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TalkerUi from "./components/talker/TalkerUi.jsx";
import Mailverification from "./components/Mailverification.jsx";
import ShareConversation from "./components/ShareConversation.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import OfflinePage from "./components/OfflinePage.jsx";
import { useState, useEffect } from "react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />, // Public Route
  },
  {
    path: "/signUp",
    element: <SignUp />
  },
  {
    path: "/verifyMail",
    element: <Mailverification />
  },
  {
    path: "/forgotPassword",
    element: <ForgotPassword />
  },
  {
    path: "/talker",
    element: (
      <ProtectedRoute>
        <TalkerUi />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "", // Matches "/talker"
        element: <TalkerUi />
      },
      {
        path: "c/:conversationId", // Matches "/talker/c/:conversationId"
        element: <TalkerUi />
      }
    ]
  },
  {
    path: "/talker/share/:conversationId/:linkToken", // Public share link route
    element: <ShareConversation />
  }
]);

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // checking internetConnection while running the app
  useEffect(() => {
    const handleNetworkChange = () => setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  return isOffline ? <OfflinePage /> : <RouterProvider router={router} />;
}

export default App