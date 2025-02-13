import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSearching: false,
};

const aiFeaturesSlice = createSlice({
  name: "aiFeatures",
  initialState,
  reducers: {
    increment(state) {
      state.value++;
    },
    decrement(state) {
      state.value--;
    },
    setIsSearching(state, action) {
      state.isSearching = action.payload;
      sessionStorage.setItem("isSearching", JSON.stringify(action.payload));
    },
  },
});

export const { increment, decrement, setIsSearching } =
  aiFeaturesSlice.actions;
export default aiFeaturesSlice.reducer;
