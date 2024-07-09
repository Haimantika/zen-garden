const express = require('express');
const path = require('path');
const axios = require('axios');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/api/care-routine', async (req, res) => {
    const plantName = req.body.plantName;
    console.log("Sending request to OpenAI with plant name:", plantName);
    try {
        console.time("Open Api Call")
        const apiRequest = {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `I have ${plantName}. Can you share a full care routine for this plant in 100 words?` }]
        };
        console.log("Request body to OpenAI:", JSON.stringify(apiRequest));

        const response = await axios.post(OPENAI_API_URL, apiRequest, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }, 
            timeout: 25000 
        });
        console.timeEnd("OpenAPI Call")
        console.log("Received response from OpenAI:", JSON.stringify(response.data));
        
        if (response.data.choices && response.data.choices.length > 0) {
            const choice = response.data.choices[0];
            if (choice.message && choice.message.content) {
                const textContent = choice.message.content;
                if (textContent.trim() !== "") {
                    res.json({ careRoutine: textContent });
                } else {
                    res.status(404).json({ error: "No care routine found" });
                }
            } else {
                res.status(404).json({ error: "No care routine found" });
            }
        } else {
            res.status(404).json({ error: "No care routine found" });
        }
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error processing your request', details: error.message });
    }
});

module.exports = serverless(app);