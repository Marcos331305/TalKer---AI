import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import messageReducer from "../features/messageSlice";
import conversationsReducer from "../features/conversationsSlice";
import sharedLinksReducer from "../features/yourDataSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    conversations: conversationsReducer,
    sharedLinks: sharedLinksReducer,
  },
});
