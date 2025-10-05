import React, { useState, useEffect } from 'react';

const SearchForm = ({ onSearch, onSaveSettings, settings, isSearching }) => {
  const [formData, setFormData] = useState({
    keyword: '',
    customDork: '',
    maxResults: '',
    apiKey: '',
    searchEngineId: '',
    useDeduplication: true,
    filterHaram: false
  });

  const [timeRanges, setTimeRanges] = useState([]);
  const [showQueryPreview, setShowQueryPreview] = useState(false);

  // Load settings into form
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        apiKey: settings.GOOGLE_API_KEY || '',
        searchEngineId: settings.GOOGLE_SEARCH_ENGINE_ID || ''
      }));
    }
  }, [settings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTimeRange = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    setTimeRanges(prev => [...prev, {
      id: Date.now(),
      after: oneWeekAgo.toISOString().split('T')[0],
      before: today.toISOString().split('T')[0]
    }]);
  };

  const removeTimeRange = (id) => {
    setTimeRanges(prev => prev.filter(range => range.id !== id));
  };

  const updateTimeRange = (id, field, value) => {
    setTimeRanges(prev => prev.map(range => 
      range.id === id ? { ...range, [field]: value } : range
    ));
  };

  const generateQueryPreview = () => {
    let baseQuery = formData.keyword;
    if (formData.customDork) {
      baseQuery += ` ${formData.customDork}`;
    }

    if (timeRanges.length === 0) {
      return [baseQuery];
    }

    return timeRanges.map(range => 
      `${baseQuery} after:${range.after} before:${range.before}`
    );
  };

  const handleSearch = () => {
    if (!formData.keyword.trim()) {
      alert('Please enter a recipe keyword');
      return;
    }

    if (!formData.apiKey.trim() || !formData.searchEngineId.trim()) {
      alert('Please enter Google API credentials');
      return;
    }

    const searchParams = {
      ...formData,
      timeRanges: timeRanges.length > 0 ? timeRanges : [{}],
      maxResults: formData.maxResults ? parseInt(formData.maxResults) : undefined
    };

    onSearch(searchParams);
  };

  const handleSaveSettings = () => {
    const settingsToSave = {
      GOOGLE_API_KEY: formData.apiKey,
      GOOGLE_SEARCH_ENGINE_ID: formData.searchEngineId
    };

    onSaveSettings(settingsToSave);
  };

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Configuration
        </h2>

        {/* Recipe Keyword */}
        <div className="mb-4">
          <label className="form-label">Recipe Keyword *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. chicken pasta"
            value={formData.keyword}
            onChange={(e) => handleInputChange('keyword', e.target.value)}
          />
        </div>

        {/* Google Dork */}
        <div className="mb-4">
          <label className="form-label">Google Dork (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. site:allrecipes.com"
            value={formData.customDork}
            onChange={(e) => handleInputChange('customDork', e.target.value)}
          />
        </div>

        {/* Time Ranges */}
        <div className="mb-4">
          <label className="form-label">Time Ranges</label>
          <div className="space-y-2 mb-2">
            {timeRanges.map(range => (
              <div key={range.id} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <input
                  type="date"
                  className="form-input flex-1"
                  value={range.after}
                  onChange={(e) => updateTimeRange(range.id, 'after', e.target.value)}
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  className="form-input flex-1"
                  value={range.before}
                  onChange={(e) => updateTimeRange(range.id, 'before', e.target.value)}
                />
                <button
                  onClick={() => removeTimeRange(range.id)}
                  className="btn btn-danger px-2 py-1 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addTimeRange}
            className="btn btn-secondary text-sm"
          >
            + Add Time Range
          </button>
        </div>

        {/* Max Results */}
        <div className="mb-4">
          <label className="form-label">Max Results per Range</label>
          <input
            type="number"
            className="form-input"
            placeholder="Unlimited"
            min="1"
            max="100"
            value={formData.maxResults}
            onChange={(e) => handleInputChange('maxResults', e.target.value)}
          />
        </div>

        {/* API Credentials */}
        <div className="mb-4">
          <label className="form-label">Google API Key *</label>
          <input
            type="password"
            className="form-input"
            placeholder="Your Google API Key"
            value={formData.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Search Engine ID *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Your Custom Search Engine ID"
            value={formData.searchEngineId}
            onChange={(e) => handleInputChange('searchEngineId', e.target.value)}
          />
        </div>

        {/* Filtering Options */}
        <div className="mb-6">
          <label className="form-label">Filtering Options</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={formData.useDeduplication}
                onChange={(e) => handleInputChange('useDeduplication', e.target.checked)}
              />
              Use Gemini to remove duplicates
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={formData.filterHaram}
                onChange={(e) => handleInputChange('filterHaram', e.target.checked)}
              />
              Filter haram recipes (remove pork/alcohol)
            </label>
          </div>
        </div>

        {/* Query Preview */}
        <div className="mb-6">
          <button
            onClick={() => setShowQueryPreview(!showQueryPreview)}
            className="btn btn-secondary text-sm mb-2"
          >
            {showQueryPreview ? 'Hide' : 'Show'} Query Preview
          </button>
          
          {showQueryPreview && (
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <div className="font-medium text-gray-700 mb-2">Generated Queries:</div>
              {generateQueryPreview().map((query, index) => (
                <div key={index} className="font-mono text-gray-600 mb-1">
                  {query}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="btn btn-primary w-full"
          >
            {isSearching ? 'Searching...' : 'Search Recipes'}
          </button>
          
          <button
            onClick={handleSaveSettings}
            className="btn btn-secondary w-full"
          >
            Save Settings to .env
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;