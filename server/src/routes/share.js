import express from "express";
import { sendEmails } from "../services/email.js";

const router = express.Router();
router.post('/share', async (req, res) => {
  try {
    let { recipients, summaryText } = req.body;

    // Make sure recipients is always an array
    if (!recipients) {
      return res.status(400).json({ success: false, error: "Recipients missing" });
    }
    if (typeof recipients === "string") {
      recipients = [recipients.trim()];
    }

    const sent = await sendEmails({
      subject: "Your Meeting Summary",
      html: `<p>${summaryText || "No summary provided"}</p>`,
      recipients,
    });

    res.json({ success: true, sent });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
