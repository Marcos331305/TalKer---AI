import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSearching: false,
  searchResults: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunk for searching the web
export const handleWebSearching = createAsyncThunk(
  "aiFeatures/handleWebSearching",
  async (query, { rejectWithValue }) => {
    try {
      const SEARCH_API_KEY = import.meta.env.VITE_WEB_SEARCH_API_KEY;
      const CX = import.meta.env.VITE_WEB_SEARCH_ENGINE_ID;

      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?q=${query}&key=${SEARCH_API_KEY}&cx=${CX}`
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error?.message || "Failed to fetch results");

      return data.items || []; // Return search results
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
      .addCase(handleWebSearching.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(handleWebSearching.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload;
        console.log(action.payload);
      })
      .addCase(handleWebSearching.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        console.error(action.payload);
      });
  },
});

export const { clearSearchResults, setIsSearching } = aiFeaturesSlice.actions;
export default aiFeaturesSlice.reducer;
