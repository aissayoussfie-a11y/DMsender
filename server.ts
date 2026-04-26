import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // Global logger to see what's reaching the server
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // META WEBHOOK VERIFICATION ENDPOINT
  // Meta will send a GET request here to verify the webhook URL
  app.get("/api/webhook", (req, res) => {
    console.log("Received GET /api/webhook request:", req.query);
    
    // Parse the query params
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // This token should match the one you set in the Meta App Dashboard
    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "my_secure_verify_token";

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      // Check the mode and token sent is correct
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        // Respond with the challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        console.log("WEBHOOK_FAILED - Token mismatch", { received: token, expected: VERIFY_TOKEN });
        res.sendStatus(403);
      }
    } else {
      // Respond with '400 Bad Request' if mode or token is missing
      console.log("WEBHOOK_FAILED - Missing mode or token");
      res.sendStatus(400);
    }
  });

  // Storage for bot configuration (In memory for now)
  let botConfig = {
    accessToken: "",
    messageTemplate: "Hey! Thanks for commenting on my reel. Here is the link you asked for: https://example.com",
    isActive: false,
  };

  // META WEBHOOK EVENT ENDPOINT
  // Meta will send POST requests here when a comment is made
  app.post("/api/webhook", async (req, res) => {
    const body = req.body;

    // Verify this is an event from a page subscription
    if (body.object === "page" || body.object === "instagram") {
      
      // Return a '200 OK' response to all requests IMMEDIATELY (important for webhooks)
      res.status(200).send("EVENT_RECEIVED");

      if (!botConfig.isActive) {
        console.log("Bot is paused. Ignoring webhooks.");
        return;
      }

      // Iterate over each entry - there may be multiple if batched
      body.entry.forEach(async function (entry: any) {
        const igUserId = entry.id; // The Instagram Account ID that received the comment
        
        // Iterate over each messaging event
        if (entry.changes) {
          for(const change of entry.changes) {
            if (change.field === "comments") {
              const commentData = change.value;
              console.log("New comment received:", commentData);
              
              const commentId = commentData.id;
              
              if (!botConfig.accessToken) {
                console.log("Cannot send DM: Access token is missing. Please configure it in the dashboard.");
                continue;
              }

              // Send private reply to comment using Graph API
              try {
                console.log(`Sending private reply to comment ${commentId}`);
                const response = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/messages`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${botConfig.accessToken}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    recipient: {
                      comment_id: commentId
                    },
                    message: {
                      text: botConfig.messageTemplate
                    }
                  })
                });

                const data = await response.json();
                if (!response.ok) {
                  console.error("Failed to send DM:", data);
                } else {
                  console.log("Successfully sent DM reply!", data);
                }
              } catch (error) {
                console.error("Error making Graph API request:", error);
              }
            }
          }
        }
      });
    } else {
      // Return a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  });

  // Basic API for the frontend dashboard
  app.get("/api/config", (req, res) => {
    res.json({
      ...botConfig,
      instagramConnected: !!botConfig.accessToken
    });
  });

  app.post("/api/config", (req, res) => {
    const { accessToken, messageTemplate, isActive } = req.body;
    if (accessToken !== undefined) botConfig.accessToken = accessToken;
    if (messageTemplate !== undefined) botConfig.messageTemplate = messageTemplate;
    if (isActive !== undefined) botConfig.isActive = isActive;
    
    res.json({ success: true, config: botConfig });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
