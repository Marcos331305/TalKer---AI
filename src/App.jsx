import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx'
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TalkerUi from "./components/talker/TalkerUi.jsx";
import Mailverification from "./components/Mailverification.jsx";
import ShareConversation from "./components/ShareConversation.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";

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
    path: "/talker/share/:conversationId", // Public share link route
    element: <ShareConversation />
  }
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App