const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Gemini AI
let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Search endpoint - handles Google Custom Search API calls
app.post('/api/search', async (req, res) => {
    try {
        const { keyword, customDork, timeRanges, maxResults, apiKey, searchEngineId } = req.body;

        if (!keyword || !apiKey || !searchEngineId) {
            return res.status(400).json({ 
                error: 'Missing required fields: keyword, apiKey, or searchEngineId' 
            });
        }

        const allResults = [];
        const searchPromises = [];

        // Process each time range
        for (const range of timeRanges || [{}]) {
            let query = keyword;
            
            // Add custom dork if provided
            if (customDork) {
                query += ` ${customDork}`;
            }
            
            // Add time range dork if provided
            if (range.after && range.before) {
                query += ` after:${range.after} before:${range.before}`;
            }

            searchPromises.push(searchGoogleCSE(query, apiKey, searchEngineId, maxResults));
        }

        // Execute all searches concurrently
        const searchResults = await Promise.all(searchPromises);
        
        // Combine all results
        searchResults.forEach(results => {
            allResults.push(...results);
        });

        // Remove duplicates based on title
        const uniqueResults = [];
        const seenTitles = new Set();
        
        allResults.forEach(result => {
            const title = result.title?.toLowerCase();
            if (title && !seenTitles.has(title)) {
                seenTitles.add(title);
                uniqueResults.push(result);
            }
        });

        res.json({
            success: true,
            results: uniqueResults,
            total: uniqueResults.length,
            query: searchPromises.length > 1 ? 'Multiple time ranges' : keyword
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            error: 'Search failed', 
            message: error.message 
        });
    }
});

// Google Custom Search API function with pagination
async function searchGoogleCSE(query, apiKey, cx, maxResults) {
    const results = [];
    let startIndex = 1;
    const resultsPerPage = 10; // Google CSE maximum
    const maxAllowed = maxResults || 100; // Default limit or user specified

    try {
        while (results.length < maxAllowed && startIndex <= 91) { // Google CSE limit
            const url = `https://www.googleapis.com/customsearch/v1`;
            const params = {
                key: apiKey,
                cx: cx,
                q: query,
                start: startIndex,
                num: Math.min(resultsPerPage, maxAllowed - results.length)
            };

            console.log(`Searching: ${query} (start: ${startIndex})`);
            
            const response = await axios.get(url, { params });
            const data = response.data;

            if (!data.items || data.items.length === 0) {
                break; // No more results
            }

            // Extract only titles
            data.items.forEach(item => {
                if (item.title && results.length < maxAllowed) {
                    results.push({
                        title: item.title,
                        link: item.link,
                        snippet: item.snippet
                    });
                }
            });

            startIndex += resultsPerPage;

            // Check if we have all available results
            if (data.searchInformation && data.searchInformation.totalResults) {
                const totalAvailable = parseInt(data.searchInformation.totalResults);
                if (results.length >= totalAvailable) {
                    break;
                }
            }

            // Rate limiting - small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

    } catch (error) {
        console.error('Google CSE API error:', error.response?.data || error.message);
        throw new Error(`Google CSE API error: ${error.response?.data?.error?.message || error.message}`);
    }

    return results;
}

// Filter endpoint - handles Gemini AI processing
app.post('/api/filter', async (req, res) => {
    try {
        const { titles, useDeduplication, filterHaram } = req.body;

        if (!titles || !Array.isArray(titles)) {
            return res.status(400).json({ error: 'Invalid titles array' });
        }

        if (!useDeduplication && !filterHaram) {
            // No filtering requested, return original titles
            return res.json({
                success: true,
                filtered: titles,
                originalCount: titles.length,
                filteredCount: titles.length
            });
        }

        if (!model) {
            return res.status(500).json({ 
                error: 'Gemini AI not configured. Please set GEMINI_API_KEY in environment variables.' 
            });
        }

        // Create prompt for Gemini
        let prompt = "You are a content filter. ";
        
        if (useDeduplication) {
            prompt += "Deduplicate this list of recipe titles. Remove exact and near duplicates. ";
        }
        
        if (filterHaram) {
            prompt += "Exclude any recipes containing pork, bacon, ham, lard, wine, beer, rum, or alcoholic ingredients. ";
        }
        
        prompt += "Return the cleaned list as a JSON array of strings (just the titles). ";
        prompt += "Here is the list:\n\n" + JSON.stringify(titles, null, 2);

        console.log('Sending to Gemini AI for filtering...');
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Gemini AI response:', text);

        // Parse the JSON response
        let filteredTitles;
        try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\[.*\]/s);
            if (jsonMatch) {
                filteredTitles = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback: try to parse the entire response
                filteredTitles = JSON.parse(text);
            }
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', parseError);
            // Fallback: return original titles if parsing fails
            filteredTitles = titles;
        }

        res.json({
            success: true,
            filtered: Array.isArray(filteredTitles) ? filteredTitles : titles,
            originalCount: titles.length,
            filteredCount: Array.isArray(filteredTitles) ? filteredTitles.length : titles.length
        });

    } catch (error) {
        console.error('Filter error:', error);
        res.status(500).json({ 
            error: 'Filtering failed', 
            message: error.message 
        });
    }
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
    try {
        const envPath = path.join(__dirname, '.env');
        const settings = {};

        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            
            lines.forEach(line => {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim();
                    // Only return non-sensitive settings or masked values
                    if (key.includes('API_KEY') || key.includes('SECRET')) {
                        settings[key] = value ? '***masked***' : '';
                    } else {
                        settings[key] = value;
                    }
                }
            });
        }

        res.json({ success: true, settings });
    } catch (error) {
        console.error('Settings load error:', error);
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        const settings = req.body;
        const envPath = path.join(__dirname, '.env');
        
        let envContent = '';
        Object.entries(settings).forEach(([key, value]) => {
            if (value && value !== '***masked***') {
                envContent += `${key}=${value}\n`;
            }
        });

        fs.writeFileSync(envPath, envContent);
        console.log('Settings saved to .env file');

        // Reload environment variables
        delete require.cache[require.resolve('dotenv')];
        dotenv.config();

        // Reinitialize Gemini AI if API key changed
        if (settings.GEMINI_API_KEY && settings.GEMINI_API_KEY !== '***masked***') {
            genAI = new GoogleGenerativeAI(settings.GEMINI_API_KEY);
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }

        res.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Settings save error:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Recipe Search Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});