import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
} from "date-fns";

// function for generating uniqueId's
export function generateUniqueId() {
  const timestamp = Date.now(); // Current timestamp
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Random integer between 1000 and 9999
  const stringId = `${timestamp}${randomSuffix}`; // Combine timestamp and random number
  return Number(stringId);
}

// function for arranging the fetchedMessage in the desired manner
export function arrangeFetchedMessages(messages) {
  // First, sort the messages by the `created_at` timestamp
  const sortedByTimestamp = messages.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  // Then, reorder the messages to alternate between user and TalKer
  let sortedBySender = [];
  let userMessages = sortedByTimestamp.filter((msg) => msg.sender === "user");
  let talkerMessages = sortedByTimestamp.filter(
    (msg) => msg.sender === "TalKer"
  );

  // Interleave the user and TalKer messages while keeping the order
  while (userMessages.length > 0 || talkerMessages.length > 0) {
    if (userMessages.length > 0) {
      sortedBySender.push(userMessages.shift()); // Add a user message
    }
    if (talkerMessages.length > 0) {
      sortedBySender.push(talkerMessages.shift()); // Add a TalKer message
    }
  }

  return sortedBySender;
}

// function for parsingCodeandText seperately
export const parseTalKerResponse = (message) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g; // Regex to match code blocks
  const content = []; // Array to hold both text and code
  let lastIndex = 0; // Tracks the end of the last match
  let match;

  while ((match = codeBlockRegex.exec(message)) !== null) {
    // Push text between code blocks
    if (lastIndex < match.index) {
      const text = message.slice(lastIndex, match.index).trim();
      if (text) {
        content.push({ type: "text", value: text });
      }
    }

    // Push the code block
    content.push({
      type: "code",
      language: match[1] || "plaintext", // Extract language, default to plaintext
      value: match[2], // Extract code
    });

    lastIndex = codeBlockRegex.lastIndex; // Update lastIndex
  }

  // Add any remaining text after the last code block
  if (message && lastIndex < message.length) {
    const remainingText = message.slice(lastIndex).trim();
    if (remainingText) {
      content.push({ type: "text", value: remainingText });
    }
  }
  return content;
};

// function for conversationsGrouping based on their creation time
function normalizeDateString(dateString) {
  // Truncate the sub-second part to 3 digits, or handle cases where there are no sub-seconds
  return dateString.replace(/(\.\d{3})\d*([Z+-])/, "$1$2"); // Keep only 3 digits for milliseconds
}

export function groupConversationsByTime(conversations = []) {
  const grouped = {
    today: [],
    yesterday: [],
    previous7Days: [],
    previous30Days: [],
  };

  // Get the current date in UTC
  const now = new Date();
  const todayStartUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ); // Start of today in UTC

  conversations.forEach((convo) => {
    if (!convo.created_at) {
      console.error("Missing createdAt for conversation:", convo);
      return; // Skip if createdAt is missing
    }

    let createdAt;
    try {
      // Normalize the date string for proper format and parse it as UTC
      const normalizedDateString = normalizeDateString(convo.created_at);

      createdAt = new Date(normalizedDateString); // Parse the normalized date string

      if (isNaN(createdAt)) {
        throw new Error("Invalid date");
      }
    } catch (error) {
      console.error("Invalid date format:", convo.created_at, error);
      return; // Skip invalid dates
    }

    // Group conversations based on date
    if (isToday(createdAt)) {
      grouped.today.push(convo);
    } else if (isYesterday(createdAt)) {
      grouped.yesterday.push(convo);
    } else if (isThisWeek(createdAt)) {
      grouped.previous7Days.push(convo);
    } else if (isThisMonth(createdAt)) {
      grouped.previous30Days.push(convo);
    } else {
      // Add the month directly to grouped object
      const monthKey = format(createdAt, "MMMM yyyy");
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(convo);
    }
  });
  
  return grouped;
}

export const prepareDataForSummarization = async(searchData) => {
  let extractedData = [];

   // 1️⃣ Extract Knowledge Graph Info (if available)
   if (searchData.knowledgeGraph) {
    const { title, type, attributes } = searchData.knowledgeGraph;

    if (title) extractedData.push(`**${title}**`);
    if (type) extractedData.push(`**Type**: ${type}`);

    // Extract attributes dynamically (if present)
    if (attributes && typeof attributes === "object") {
      Object.entries(attributes).forEach(([key, value]) => {
        if (typeof value === "string") {
          extractedData.push(`- **${key}**: ${value}`);
        }
      });
    }
  }

  // 2️⃣ Add Organic Search Results
  if (searchData.organic?.length) {
    searchData.organic.forEach((result) => {
      extractedData.push(`- **${result.title}**: ${result.snippet}`);
    });
  }

  // 3️⃣ If No Relevant Data Found
  if (extractedData.length === 0) {
    extractedData.push("No relevant search results found.");
  }

  // 4️⃣ Convert Array to Single String
  return extractedData.join("\n\n");
};
