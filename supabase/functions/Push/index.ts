import "react-native-url-polyfill/auto";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

Deno.serve(async (req) => {
  try {
    // Log request details
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));

    // Parse and log the request body
    let body;
    try {
      body = await req.json();
      console.log("Request body:", body);
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({
          error: "Could not parse request body as JSON",
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const { userId, message } = body;

    // Validate userId
    if (!userId) {
      console.log("userId is missing from body:", body);
      return new Response(
        JSON.stringify({
          error: "userId is required in the request body",
          receivedBody: body,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("Querying database for userId:", userId);

    // Query the database
    // Instead of .single() which errors when no rows are found
    const { data: users, error } = await supabase
      .from("users")
      .select("expo_push_token")
      .eq("id", userId);

    if (error) {
      return new Response(
        JSON.stringify({
          error: `Database error: ${error.message}`,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          error: `No user found with ID: ${userId}`,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    const user = users[0];

    if (!user.expo_push_token) {
      return new Response(
        JSON.stringify({
          error: `User found but has no expo_push_token`,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const expoPushToken = user.expo_push_token;
    console.log("Found expo_push_token:", expoPushToken);

    console.log("Sending push notification to Expo");
    const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}`,
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        body: message || "You have a new notification!",
      }),
    });

    const result = await expoRes.json();
    console.log("Expo API response:", result);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Server Error:", err);
    return new Response(
      JSON.stringify({
        error: `Internal Server Error: ${err.message}`,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
