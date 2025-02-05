import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../scripts/supabaseClient";
import { format } from "date-fns";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

const initialState = {
  userData: [],
  conversationsData: [],
  messagesData: [],
  sharedLinksData: [],
  sharedLinks: [],
  sharedLinkToken: null,
  loading: false,
  error: null,
};

// Async thunk to fetch data from users, shared_links, and conversations tables
export const fetchEntireUserDataFromSupabase = createAsyncThunk(
  "yourData/fetchEntireUserDataFromSupabase", // Action type
  async (userId, { rejectWithValue }) => {
    try {
      // Fetch user data only for currentUser from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (userError) throw new Error(userError.message);

      // Fetch conversations data only for currentUser from conversations table
      const { data: conversationsData, error: conversationsError } =
        await supabase.from("conversations").select("*").eq("user_id", userId);

      if (
        conversationsError ||
        (conversationsData && conversationsData.length === 0)
      ) {
        throw new Error(
          conversationsError
            ? conversationsError.message
            : "No conversations found for this user."
        );
      }

      // Fetch messages data only for currentUser from messages table
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .in(
          "conversation_id",
          conversationsData.map((conv) => conv.conversation_id)
        );

      if (messagesError) throw new Error(messagesError.message);

      // Fetch shared links data only for currentUser from shared_links table
      const { data: sharedLinksData, error: sharedLinksError } = await supabase
        .from("shared_links")
        .select("*")
        .eq("user_id", userId);

      if (sharedLinksError) throw new Error(sharedLinksError.message);

      // Return all the fetched data as an object
      return { userData, conversationsData, messagesData, sharedLinksData };
    } catch (error) {
      // Return error if any of the fetches fail
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to create JSON files and zip them for download
export const generateAndDownloadZip = createAsyncThunk(
  "yourData/generatedAndDownloadZip",
  async (
    { userData, conversationsData, messagesData, sharedLinksData }, // Received data from previous fetch
    { rejectWithValue }
  ) => {
    try {
      // Create a new instance of JSZip
      const zip = new JSZip();

      // Create JSON files from the fetched data
      zip.file("user.json", JSON.stringify(userData, null, 2));
      zip.file(
        "conversations.json",
        JSON.stringify(conversationsData, null, 2)
      );
      zip.file("messages.json", JSON.stringify(messagesData, null, 2));
      zip.file("shared_links.json", JSON.stringify(sharedLinksData, null, 2));

      // Generate the zip file as a blob
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Auto-download the ZIP file
      saveAs(zipBlob, "your_data.zip");

      return true; // Inditate success
    } catch (error) {
      return rejectWithValue(error.message); // Handle any error during file creation
    }
  }
);

// Async thunk for handling the entire data export process
export const exportUserData = createAsyncThunk(
  "yourData/exportUserData",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      // Step 1: Fetch user data
      const { userData, conversationsData, messagesData, sharedLinksData } =
        await dispatch(fetchEntireUserDataFromSupabase(userId)).unwrap();

      // Step 2: Create JSON files and zip them for download
      await dispatch(
        generateAndDownloadZip({
          userData,
          conversationsData,
          messagesData,
          sharedLinksData,
        })
      ).unwrap();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const validateSharedLink = createAsyncThunk(
  "sharedLinks/validateSharedLink",
  async (linkToken, { rejectWithValue }) => {
    try {
      // Validate linkToken with Supabase
      const { data, error } = await supabase
        .from("shared_links")
        .select("*")
        .eq("link_id_token", linkToken);

      // Check for errors or empty results
      if (error) {
        throw new Error(error.message); // Handle Supabase errors
      }
      if (data.length === 0) {
        throw new Error("Invalid link"); // Handle "no match" case
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

export const yourDataSlice = createSlice({
  name: "yourData",
  initialState,
  reducers: {
    addSharedLink: (state, action) => {
      // If sharedLinks is empty, simply add the link
      if (state.sharedLinks.length === 0) {
        state.sharedLinks = [action.payload];
      } else {
        // Check if the link already exists based on conversation_id
        const linkExists = state.sharedLinks.some(
          (link) => link.conversation_id === action.payload.conversation_id
        );

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
          (link) => link.link_id_token !== link_id
        );
        // Update the state with the new conversations array
        state.sharedLinks = updatedSharedLinks;
      }
    },
    currentlySharedLinkToken: (state, action) => {
      const { conversationId } = action.payload;
      if (conversationId) {
        // Find the shared link token that matches the conversationId
        const currentlySharedLink = state.sharedLinks.find(
          (link) => link.conversation_id === conversationId
        );
        if (currentlySharedLink) {
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
      })
      // fetch the entire data for currentUser
      .addCase(fetchEntireUserDataFromSupabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntireUserDataFromSupabase.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload.userData;
        state.conversationsData = action.payload.conversationsData;
        state.messagesData = action.payload.messagesData;
        state.sharedLinksData = action.payload.sharedLinksData;
      })
      .addCase(fetchEntireUserDataFromSupabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Error message from rejected action
      })
      // exportUserData
      .addCase(exportUserData.pending, (state) => {
        state.error = null; // Reset error before starting export
      })
      .addCase(exportUserData.rejected, (state, action) => {
        state.error = action.payload || "Oops! Something went wrong while exporting your data. Please try again later.";
        toast.error(state.error, {
          position: "top-center",
          theme: "dark",
          style: {
              borderRadius: '8px',
              ...(window.innerWidth > 768 && { minWidth: '450px' }) // Apply only for large screens
          }
        });
      });
  },
});

// Action creators are generated for each case reducer function
export const {
  addSharedLink,
  delSharedLink,
  currentlySharedLinkToken,
  delAllSharedLinks,
} = yourDataSlice.actions;

export default yourDataSlice.reducer;
