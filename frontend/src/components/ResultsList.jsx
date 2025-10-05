import React from 'react';

const ResultsList = ({ results, searchQuery, onExportCSV, originalCount, filteredCount }) => {
  if (!results || results.length === 0) {
    return (
      <div className="card p-6 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
        <p className="text-gray-600">
          Enter your search criteria and click "Search Recipes" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Results Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Search Results</h3>
            {searchQuery && (
              <p className="text-gray-600 text-sm mt-1">
                Showing results for: <span className="font-medium">"{searchQuery}"</span>
              </p>
            )}
          </div>
          <button
            onClick={onExportCSV}
            className="btn btn-primary flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CSV
          </button>
        </div>

        {/* Results Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
            </svg>
            {results.length} recipes found
          </span>
          
          {originalCount && originalCount !== filteredCount && (
            <span className="flex items-center text-blue-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              Filtered from {originalCount} results
            </span>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="max-h-96 overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {results.map((result, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {result.link ? (
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {result.title}
                      </a>
                    ) : (
                      result.title
                    )}
                  </h4>
                  
                  {result.snippet && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {result.snippet}
                    </p>
                  )}
                  
                  {result.link && (
                    <p className="text-gray-400 text-xs mt-1 truncate">
                      {result.link}
                    </p>
                  )}
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    #{index + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Reminder */}
      {results.length > 10 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Found {results.length} recipes. Use the "Download CSV" button to export all results.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsList;