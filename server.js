const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname, {etag: false, lastModified: false, setHeaders: (res) => res.setHeader('Cache-Control', 'no-store')}));

// Proxy route to Anthropic API
app.post('/api/chat', async (req, res) => {
  const { apiKey, messages, system } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system,
        messages,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`FitAI server running at http://localhost:${PORT}`));
