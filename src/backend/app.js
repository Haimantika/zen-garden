require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('Serving static files from:', path.join(__dirname, '../src'));
app.use(express.static(path.join(__dirname, '../src')));

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
app.get('/search', (req, res) => {
    // Adjust the path according to your project structure
    res.sendFile(path.join(__dirname, '../search.html'));
});

app.post('/care-routine', async (req, res) => {
    const plantName = req.body.plantName;
    console.log("Sending request to OpenAI with plant name:", plantName);

    try {
        const apiRequest = {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `I have ${plantName}. Share a full care routine for this plant in 100 words.` }]
        };
        console.log("Request body to OpenAI:", JSON.stringify(apiRequest));

        const response = await axios.post('https://api.openai.com/v1/chat/completions', apiRequest, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Received response from OpenAI:", JSON.stringify(response.data)); // Detailed log of the response

        // Confirming the actual structure here
        if (response.data.choices && response.data.choices.length > 0) {
            const choice = response.data.choices[0];
            // Check if 'text' or 'message' needs to be accessed differently
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


