# Recipe Search App

A full-stack React + Node.js application that searches recipes using Google Custom Search API and filters them with Google Gemini AI.

## Features

- 🔍 **Google Custom Search Integration** - Search recipes across the web
- 🤖 **AI-Powered Filtering** - Remove duplicates and filter content with Gemini AI
- 📅 **Time Range Selection** - Search within specific date ranges
- 📊 **CSV Export** - Download results as CSV files
- ⚙️ **Settings Management** - Save API keys and configuration to .env
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Architecture

### Frontend (React + Vite + TailwindCSS)
- Modern React application with hooks
- Clean, responsive UI with TailwindCSS
- Real-time search and filtering
- CSV export functionality

### Backend (Node.js + Express)
- RESTful API endpoints
- Google Custom Search API integration with pagination
- Google Gemini AI integration for content filtering
- Environment variable management

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (version 18+ recommended)
2. **npm** or **yarn** package manager
3. **Google API Key** with Custom Search API enabled
4. **Google Custom Search Engine ID**
5. **Google Gemini API Key** (optional, for AI filtering)

### Getting API Keys

#### Google Custom Search API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Custom Search API"
4. Create credentials (API Key)
5. Create a Custom Search Engine at [CSE Control Panel](https://cse.google.com/)

#### Google Gemini API
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Get an API key for Gemini models

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ouzza213/recipe-search-app.git
cd recipe-search-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the environment template:
```bash
cp ../.env.example .env
```

Edit `.env` and add your API keys:
```env
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Running the Application

#### Development Mode

Start the backend server:
```bash
cd backend
npm run dev
```

In a new terminal, start the frontend:
```bash
cd frontend  
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

#### Production Mode

Build the frontend:
```bash
cd frontend
npm run build
```

Start the backend:
```bash
cd backend
npm start
```

## Usage

1. **Enter Search Criteria**
   - Recipe keyword (required)
   - Optional Google dork (e.g., `site:allrecipes.com`)
   - Time ranges (optional)
   - Max results per range

2. **Configure API Keys**
   - Enter Google API Key and Search Engine ID
   - Optionally add Gemini API key for AI filtering

3. **Select Filtering Options**
   - Use Gemini to remove duplicates
   - Filter haram recipes (remove pork/alcohol)

4. **Search and Export**
   - Click "Search Recipes" to start
   - View results and export to CSV

## API Endpoints

### Backend Routes

- `GET /api/health` - Health check
- `POST /api/search` - Search recipes via Google CSE
- `POST /api/filter` - Filter results with Gemini AI
- `GET /api/settings` - Load current .env settings
- `POST /api/settings` - Save settings to .env file

### Example API Usage

```javascript
// Search for recipes
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keyword: 'chicken pasta',
    customDork: 'site:allrecipes.com',
    timeRanges: [{ after: '2024-01-01', before: '2024-12-31' }],
    maxResults: 50,
    apiKey: 'your-api-key',
    searchEngineId: 'your-engine-id'
  })
});
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Cloud API key | Yes |
| `GOOGLE_SEARCH_ENGINE_ID` | Custom Search Engine ID | Yes |
| `GEMINI_API_KEY` | Gemini AI API key | No |
| `PORT` | Server port | No (default: 5000) |

### Google Custom Search Setup

1. Visit [Google Custom Search](https://cse.google.com/)
2. Click "Add" to create a new search engine
3. Configure sites to search (or use "Search entire web")
4. Copy the Search Engine ID from the control panel

## Project Structure

```
recipe-search-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── SearchForm.jsx
│   │   │   ├── ResultsList.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── TimeRangePicker.jsx
│   │   ├── App.jsx          # Main application component
│   │   ├── main.jsx         # Application entry point
│   │   └── index.css        # Styles with TailwindCSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # TailwindCSS configuration
├── backend/                 # Node.js backend server
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── .env.example            # Environment template
└── README.md              # This file
```

## Features in Detail

### Search Configuration
- **Recipe Keyword**: Primary search term (required)
- **Google Dork**: Additional search operators (optional)
- **Time Ranges**: Calendar-based date selection for temporal filtering
- **Max Results**: Limit results per time range (default: unlimited)

### AI Filtering
- **Deduplication**: Remove exact and near-duplicate recipes using Gemini AI
- **Haram Filtering**: Exclude recipes containing pork, alcohol, or other haram ingredients
- **Smart Processing**: Handles edge cases and parsing errors gracefully

### Export & Settings
- **CSV Export**: Download results in standard CSV format
- **Settings Persistence**: Save API keys and configuration to .env file
- **Query Preview**: See generated search queries before execution

## Error Handling

The application includes comprehensive error handling for:
- Invalid API credentials
- Rate limiting
- Network failures
- Malformed responses
- Missing environment variables

## Security Considerations

- API keys are stored server-side only
- CORS configuration for secure frontend-backend communication
- Input validation and sanitization
- No sensitive data in frontend bundle

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/ouzza213/recipe-search-app/issues) page
2. Review the API documentation
3. Ensure all environment variables are correctly set
4. Verify API keys have proper permissions

## Acknowledgments

- Google Custom Search API for web search capabilities
- Google Gemini AI for intelligent content filtering
- React and Node.js communities for excellent frameworks
- TailwindCSS for utility-first styling approach