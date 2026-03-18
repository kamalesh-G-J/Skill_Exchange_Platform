const express = require("express");
const { google } = require("googleapis");
const mongoose = require("mongoose");
const Session = require("../models/Session");
const User = require("../models/User");

const router = express.Router();

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// @route   GET /api/calendar/auth-url
// @desc    Get Google OAuth URL for Calendar integration
router.get("/auth-url", (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required" });
  }

  // Define the scopes required
  const scopes = ["https://www.googleapis.com/auth/calendar.events"];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: sessionId, // Pass sessionId in state so we know which session we are scheduling for
    prompt: "consent",
  });

  res.json({ url: authUrl });
});

// @route   GET /api/calendar/auth/callback
// @desc    Google OAuth Callback
router.get("/auth/callback", async (req, res) => {
  const { code, state } = req.query;
  const sessionId = state; // The sessionId we passed earlier

  try {
    // 1. Get tokens from Google mapping to the code
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2. Find the session and the users
    const session = await Session.findById(sessionId).populate("hostId").populate("guestId");
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const host = session.hostId;
    const guest = session.guestId;

    // 3. Create Google Calendar Event
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Calculate end time
    const startTime = new Date(session.scheduledAt);
    const endTime = new Date(startTime.getTime() + session.durationMins * 60000);

    const event = {
      summary: `Skill Exchange Session`,
      description: `A skill exchange session between ${host.name} and ${guest.name}.`,
      start: {
        dateTime: startTime.toISOString(),
      },
      end: {
        dateTime: endTime.toISOString(),
      },
      attendees: [{ email: host.email }, { email: guest.email }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${sessionId}-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    };

    // Insert the event
    const eventResponse = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1, // Needed to create Google Meet link
      sendUpdates: "all", // Send emails to both users
    });

    const meetLink = eventResponse.data.hangoutLink;

    // 4. Update the Session in the DB
    session.meetLink = meetLink;
    await session.save();

    // 5. Redirect back to frontend
    // Change this to match your frontend port/URL
    res.redirect(`http://localhost:5173/sessions?meetCreated=true`);
  } catch (error) {
    console.error("Google Calendar API Error:", error);
    res.status(500).send("Error creating Google Meet schedule. Please try again.");
  }
});

module.exports = router;
