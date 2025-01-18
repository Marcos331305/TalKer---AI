import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../scripts/supabaseClient";
import { format } from "date-fns";

const initialState = {
  sharedLinks: [],
  loading: false,
  error: null,
};

// Async thunk for fetching shared links
export const fetchSharedLinksFromSupabase = createAsyncThunk(
  "sharedLinks/fetchSharedLinksFromSupabase",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("shared_links")
        .select("*")
        .eq("user_id", userId);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk for storing a sharingLink in supaBase
export const storeSharedLinkInSupabase = createAsyncThunk(
  "sharedLinks/storeSharedLinkInSupabase",
  async ({ userId, title, convoId }, { rejectWithValue }) => {
    try {
      // Check if the link already exists for the given conversation_id
      const { data, error } = await supabase
        .from("shared_links")
        .select("conversation_id")
        .eq("conversation_id", convoId)
        .maybeSingle(); // This will return null if no rows are found

      if (error) {
        // Handle the error if necessary
        throw error;
      }

      if (data) {
        return; // Exit without inserting
      } else {
        // If no existing link found, insert the new shared link
        const { error: insertError } = await supabase
          .from("shared_links")
          .insert([
            {
              user_id: userId,
              clickable_name: title,
              conversation_id: convoId,
              shared_date: new Date(),
            },
          ]);

        if (insertError) {
          throw insertError;
        }
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sharedLinksSlice = createSlice({
  name: "sharedLinks",
  initialState,
  reducers: {
    addSharedLink: (state, action) => {
      console.log("executing....");
      console.log("addSharedLink reducer: ", action.payload);
      state.sharedLinks.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shared links
      .addCase(fetchSharedLinksFromSupabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSharedLinksFromSupabase.fulfilled, (state, action) => {
        state.loading = false;
        // Format each shared_date to 'MMMM dd, yyyy'
        const formattedLinks = action.payload.map((link) => ({
          ...link, // Copy all other properties of the link
          shared_date: format(new Date(link.shared_date), "MMMM dd, yyyy"), // Format the date
        }));

        state.sharedLinks = formattedLinks; // Set the formatted links to state
      })
      .addCase(fetchSharedLinksFromSupabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log(state.sharedLinks);
      })
      // Create a shared link
      .addCase(storeSharedLinkInSupabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(storeSharedLinkInSupabase.fulfilled, (state, action) => {
        state.loading = false;
        state.sharedLinks.push(action.payload); // Add the new link to the state
      })
      .addCase(storeSharedLinkInSupabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log(state.error);
      });
    // Delete (deactivate) a shared link
    // .addCase(deleteSharedLink.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(deleteSharedLink.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.sharedLinks = state.sharedLinks.filter(
    //     (link) => link.id !== action.payload
    //   );
    // })
    // .addCase(deleteSharedLink.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // });
  },
});

// Action creators are generated for each case reducer function
export const { addSharedLink } = sharedLinksSlice.actions;

export default sharedLinksSlice.reducer;
