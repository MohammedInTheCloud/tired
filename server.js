const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/query-ollama', async (req, res) => {
  console.log('Received request:', req.body);
  try {
    console.log('Sending request to Ollama...');
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    console.log('Ollama response status:', ollamaResponse.status);

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.status}`);
    }

    // Read the response as text
    const responseText = await ollamaResponse.text();
    
    // Parse the response text as a series of JSON objects
    const jsonResponses = responseText.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line));

    // Combine all responses into a single response
    const combinedResponse = jsonResponses.reduce((acc, curr) => {
      if (curr.response) acc.response += curr.response;
      acc.done = curr.done;
      return acc;
    }, { response: '', done: false });

    res.json(combinedResponse);
  } catch (error) {
    console.error('Error querying Ollama:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Proxy server running on port 3000'));