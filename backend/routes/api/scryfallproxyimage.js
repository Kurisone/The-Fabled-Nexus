const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing URL");

    const decodedUrl = decodeURIComponent(url);
    const response = await fetch(decodedUrl);
    if (!response.ok) throw new Error(`Failed to fetch ${decodedUrl}`);

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Failed to fetch image");
  }
});

module.exports = router;