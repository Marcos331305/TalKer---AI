import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { webSearchApi } from "../redux/webSearchApi";
import { prepareDataForSummarization } from "../scripts/app";

const initialState = {
  isSearching: false,
  searchResults: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunk for searching the web
export const handleWebSearch = createAsyncThunk(
  "aiFeatures/handleWebSearch",
  async ({ query }, { dispatch, rejectWithValue }) => {
    try {
      // Call RTK Query's searchGoogle endpoint
      const searchedResponse = await dispatch(
        webSearchApi.endpoints.searchGoogle.initiate(query)
      ).unwrap(); // `unwrap()` ensures we properly handle errors

      const preparedData = await prepareDataForSummarization(searchedResponse);

      const summarizationInstructions =
        "Summarize the following data while ensuring all key information is included. Format it in a structured manner with headings and bullet points. The summary should be well-organized and easy to read";
      const actualPrompt = `${preparedData}\n\n${summarizationInstructions}`;

      return actualPrompt;
    } catch (error) {
      return rejectWithValue(error.message);
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
        state.status = "failed";
        state.error = action.payload;
        console.error(action.payload);
      });
  },
});

export const { clearSearchResults, setIsSearching } = aiFeaturesSlice.actions;
export default aiFeaturesSlice.reducer;
