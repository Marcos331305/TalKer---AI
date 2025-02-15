import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import messageReducer from "../features/messageSlice";
import conversationsReducer from "../features/conversationsSlice";
import sharedLinksReducer from "../features/yourDataSlice";
import aiFeaturesReducer from "../features/aiFeaturesSlice";
import { webSearchApi } from "./webSearchApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    conversations: conversationsReducer,
    yourData: sharedLinksReducer,
    aiFeatures: aiFeaturesReducer,
    [webSearchApi.reducerPath]: webSearchApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(webSearchApi.middleware)
});
