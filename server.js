const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({limit:'5mb'}));
app.use(express.static(__dirname, {etag: false, lastModified: false, setHeaders: (res) => res.setHeader('Cache-Control', 'no-store')}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'alufei_kayitz.html'));
});

const DATA_FILE = path.join(__dirname, 'users_data.json');

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return {}; }
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data), 'utf8');
}

// קרא את כל המשתמשים
app.get('/api/users', (req, res) => {
  res.json(readData());
});

// עדכן משתמש בודד
app.post('/api/users/:username', (req, res) => {
  const data = readData();
  data[req.params.username] = req.body;
  writeData(data);
  res.json({ok: true});
});

// מחק משתמש
app.delete('/api/users/:username', (req, res) => {
  const data = readData();
  delete data[req.params.username];
  writeData(data);
  res.json({ok: true});
});

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
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
