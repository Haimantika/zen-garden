const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');

const app = express();
app.use(express.json());

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getOpenAIResponse(plantName) {
  const response = await axios.post(OPENAI_API_URL, {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `I have ${plantName}. Can you share a full care routine for this plant in 100 words?` }]
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.choices[0].message.content;
}

app.post('/api/care-routine', async (req, res) => {
  const plantName = req.body.plantName;
  console.log(`Received request for plant: ${plantName}`);

  let retries = 0;
  const maxRetries = 5;
  const initialWaitTime = 2000;

  while (retries < maxRetries) {
    try {
      console.time('OpenAI API call');
      const careRoutine = await getOpenAIResponse(plantName);
      console.timeEnd('OpenAI API call');

      if (careRoutine) {
        return res.json({ careRoutine });
      } else {
        throw new Error("No care routine found");
      }
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error.message);
      retries++;
      if (retries >= maxRetries) {
        return res.status(500).json({ error: 'Failed to get care routine after multiple attempts', details: error.message });
      }
      await wait(initialWaitTime * Math.pow(2, retries - 1)); // Exponential backoff
    }
  }
});

// For testing the API is running
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

module.exports = serverless(app);