import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchForm from './components/SearchForm';
import ResultsList from './components/ResultsList';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSearch = async (searchParams) => {
    setIsSearching(true);
    setError('');
    setSearchResults([]);
    setFilteredResults([]);
    setSearchQuery(searchParams.keyword);

    try {
      // First, search Google CSE
      const searchResponse = await axios.post('/api/search', searchParams);
      
      if (searchResponse.data.success) {
        const titles = searchResponse.data.results.map(result => result.title);
        setSearchResults(searchResponse.data.results);

        // Then, filter with Gemini AI if requested
        if (searchParams.useDeduplication || searchParams.filterHaram) {
          setIsFiltering(true);
          
          const filterResponse = await axios.post('/api/filter', {
            titles: titles,
            useDeduplication: searchParams.useDeduplication,
            filterHaram: searchParams.filterHaram
          });

          if (filterResponse.data.success) {
            // Map filtered titles back to full result objects
            const filteredTitles = new Set(filterResponse.data.filtered);
            const filteredFullResults = searchResponse.data.results.filter(
              result => filteredTitles.has(result.title)
            );
            setFilteredResults(filteredFullResults);
          } else {
            setError(filterResponse.data.error || 'Filtering failed');
            setFilteredResults(searchResponse.data.results);
          }
        } else {
          setFilteredResults(searchResponse.data.results);
        }
      } else {
        setError(searchResponse.data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error.response?.data?.error || error.message || 'Search failed');
    } finally {
      setIsSearching(false);
      setIsFiltering(false);
    }
  };

  const handleSaveSettings = async (newSettings) => {
    try {
      const response = await axios.post('/api/settings', newSettings);
      if (response.data.success) {
        setSettings(newSettings);
        setError('');
        // Show success message briefly
        setError('Settings saved successfully!');
        setTimeout(() => setError(''), 3000);
      } else {
        setError(response.data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      setError(error.response?.data?.error || 'Failed to save settings');
    }
  };

  const handleExportCSV = () => {
    if (filteredResults.length === 0) {
      setError('No results to export');
      return;
    }

    // Create CSV content
    const headers = ['title'];
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(result => `"${result.title.replace(/"/g, '""')}"`)
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'recipe_titles.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Recipe Search Engine
          </h1>
          <p className="text-lg text-gray-600">
            Search and filter recipes using Google Custom Search API with AI-powered deduplication
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className={`mb-6 p-4 rounded-md ${
            error.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="text-lg font-bold hover:opacity-70"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-1">
            <SearchForm
              onSearch={handleSearch}
              onSaveSettings={handleSaveSettings}
              settings={settings}
              isSearching={isSearching}
            />
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {isSearching && (
              <div className="card p-6 text-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Searching recipes...</p>
              </div>
            )}

            {isFiltering && !isSearching && (
              <div className="card p-6 text-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Filtering results with AI...</p>
              </div>
            )}

            {!isSearching && !isFiltering && (
              <ResultsList
                results={filteredResults}
                searchQuery={searchQuery}
                onExportCSV={handleExportCSV}
                originalCount={searchResults.length}
                filteredCount={filteredResults.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;