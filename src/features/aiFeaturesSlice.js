import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { webSearchApi } from "../redux/webSearchApi";
import { prepareDataForSummarization } from "../scripts/app";
import { setMessages } from "./messageSlice";

const initialState = {
  messages: [],
  isSearching: false,
  searchResults: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunk for searching the web
export const handleWebSearch = createAsyncThunk(
  "aiFeatures/handleWebSearch",
  async ({ query, dummyMsgId }, { getState, dispatch, rejectWithValue }) => {
    let messages = getState().messages.messages;
    try {
      // Initiate the search request
      const searchAction = dispatch(webSearchApi.endpoints.searchGoogle.initiate(query));
      const searchedResponse = await searchAction.unwrap(); // Ensure error handling

      const preparedData = await prepareDataForSummarization(searchedResponse);

      const summarizationInstructions =
        "Summarize the following data while ensuring all key information is included. Format it in a structured manner with headings and bullet points. The summary should be well-organized and easy to read";
      const actualPrompt = `${preparedData}\n\n${summarizationInstructions}`;

      return actualPrompt;
    } catch (error) {
      if (dummyMsgId) {
        messages = messages.map((msg) =>
          msg.id === dummyMsgId
            ? {
                ...msg,
                content:
                  "Oops, something went wrong. Please try again or try with a different prompt.",
              }
            : msg
        );
        dispatch(setMessages(messages));
      }

      return rejectWithValue({
        error: error.message || "Failed to search the web",
      });
    }
  }
);

const aiFeaturesSlice = createSlice({
  name: "aiFeatures",
  initialState,
  reducers: {
    clearSearchResults(state) {
      state.results = [];
      state.status = "idle";
      state.error = null;
    },
    setIsSearching(state, action) {
      state.isSearching = action.payload;
      sessionStorage.setItem("isSearching", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // handle webSearching
      .addCase(handleWebSearch.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(handleWebSearch.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload;
      })
      .addCase(handleWebSearch.rejected, (state, action) => {
        state.error = action.payload?.error || "An unknown error occurred";
        state.status = "failed";
      });
  },
});

export const { clearSearchResults, setIsSearching } = aiFeaturesSlice.actions;
export default aiFeaturesSlice.reducer;
