import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../scripts/supabaseClient";
import { format } from "date-fns";

const initialState = {
  sharedLinks: [],
  sharedLinkToken: null,
  loading: false,
  error: null,
};

export const validateSharedLink = createAsyncThunk(
  "sharedLinks/validateSharedLink",
  async (linkToken, { rejectWithValue }) => {
    try {
      // Validate linkToken with Supabase
      const { data, error } = await supabase
        .from('shared_links')
        .select('*')
        .eq('link_id_token', linkToken);

      // Check for errors or empty results
      if (error) {
        throw new Error(error.message); // Handle Supabase errors
      }
      if (data.length === 0) {
        throw new Error('Invalid link'); // Handle "no match" case
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete all sharedLinks from Supabase
export const delAllSharedLinksFromSupabase = createAsyncThunk(
  "sharedLinks/delAllSharedLinksFromSupabase",
  async (userId, { rejectWithValue }) => {
    try {
      // Delete all rows where userId matches
      const { error } = await supabase
        .from("shared_links")
        .delete()
        .eq("user_id", userId);
      if (error) {
        throw error;
      }
    } catch (error) {
      return rejectWithValue(error.message); // Return the error message in case of failure
    }
  }
);

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

// Create an async thunk for deleting a sharedLink from Supabase
export const delSharedLinkFromSupabase = createAsyncThunk(
  "sharedLink/delSharedLinkFromSupabase",
  async (link_id, { rejectWithValue }) => {
    try {
      // Perform the delete operation in Supabase
      const { error } = await supabase
        .from("shared_links")
        .delete()
        .eq("link_id_token", link_id); // Make sure 'id' is the correct column name in your table
      if (error) {
        throw error;
      }
    } catch (error) {
      return rejectWithValue(error.message); // Return the error message in case of failure
    }
  }
);

// Thunk for storing a sharingLink in supaBase
export const storeSharedLinkInSupabase = createAsyncThunk(
  "sharedLinks/storeSharedLinkInSupabase",
  async ({ link_token, userId, title, convoId }, { rejectWithValue }) => {
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
              link_id_token: link_token,
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
      // If sharedLinks is empty, simply add the link
      if (state.sharedLinks.length === 0) {
        state.sharedLinks = [action.payload];
      } else {
        // Check if the link already exists based on conversation_id
        const linkExists = state.sharedLinks.some(link => link.conversation_id === action.payload.conversation_id);
    
        if (!linkExists) {
          state.sharedLinks = [action.payload, ...state.sharedLinks];
        }
      }
    },
    delSharedLink: (state, action) => {
      const { link_id } = action.payload;
      if (link_id) {
        // Filter out the conversation that matches the conversationId
        const updatedSharedLinks = state.sharedLinks.filter(
          (link) =>
            link.link_id_token !== link_id
        );
        // Update the state with the new conversations array
        state.sharedLinks = updatedSharedLinks;
      }
    },
    currentlySharedLinkToken: (state, action) => {
      const { conversationId } = action.payload;
      if(conversationId){
        // Find the shared link token that matches the conversationId
        const currentlySharedLink = state.sharedLinks.find(
          (link) => link.conversation_id === conversationId
        );
        if(currentlySharedLink){
          state.sharedLinkToken = currentlySharedLink.link_id_token;
        }
      }
    },
    delAllSharedLinks: (state) => {
      state.sharedLinks = [];
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
        const formattedLinks = action.payload?.map((link) => ({
          ...link, // Copy all other properties of the link
          shared_date: format(new Date(link.shared_date), "MMMM dd, yyyy"), // Format the date
        }));

        state.sharedLinks = formattedLinks; // Set the formatted links to state
      })
      .addCase(fetchSharedLinksFromSupabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // validate sharedLink
       .addCase(validateSharedLink.pending, (state) => {
        state.loading = true; 
        state.error = null; // Clear previous errors
      })
      .addCase(validateSharedLink.fulfilled, (state) => {
        state.loading = false;
        state.error = null; // No errors on success
      })
      .addCase(validateSharedLink.rejected, (state, action) => {
        state.loading = false; 
        state.error = action.payload; 
      });
  },
});

// Action creators are generated for each case reducer function
export const { addSharedLink, delSharedLink, currentlySharedLinkToken, delAllSharedLinks } = sharedLinksSlice.actions;

export default sharedLinksSlice.reducer;
