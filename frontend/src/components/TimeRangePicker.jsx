import React, { useState } from 'react';

const TimeRangePicker = ({ ranges, onRangesChange }) => {
  const addRange = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const newRange = {
      id: Date.now(),
      after: oneWeekAgo.toISOString().split('T')[0],
      before: today.toISOString().split('T')[0]
    };
    
    onRangesChange([...ranges, newRange]);
  };

  const removeRange = (id) => {
    onRangesChange(ranges.filter(range => range.id !== id));
  };

  const updateRange = (id, field, value) => {
    onRangesChange(
      ranges.map(range => 
        range.id === id ? { ...range, [field]: value } : range
      )
    );
  };

  const addPresetRange = (days) => {
    const today = new Date();
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    
    const newRange = {
      id: Date.now(),
      after: startDate.toISOString().split('T')[0],
      before: today.toISOString().split('T')[0]
    };
    
    onRangesChange([...ranges, newRange]);
  };

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <div>
        <label className="form-label">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addPresetRange(7)}
            className="btn btn-secondary text-xs"
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => addPresetRange(30)}
            className="btn btn-secondary text-xs"
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => addPresetRange(90)}
            className="btn btn-secondary text-xs"
          >
            Last 90 days
          </button>
          <button
            type="button"
            onClick={() => addPresetRange(365)}
            className="btn btn-secondary text-xs"
          >
            Last year
          </button>
        </div>
      </div>

      {/* Custom Ranges */}
      <div>
        <label className="form-label">Custom Time Ranges</label>
        <div className="space-y-2">
          {ranges.map(range => (
            <div key={range.id} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
              <div className="flex-1">
                <label className="text-xs text-gray-600">From:</label>
                <input
                  type="date"
                  className="form-input text-sm"
                  value={range.after}
                  onChange={(e) => updateRange(range.id, 'after', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600">To:</label>
                <input
                  type="date"
                  className="form-input text-sm"
                  value={range.before}
                  onChange={(e) => updateRange(range.id, 'before', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRange(range.id)}
                className="btn btn-danger px-2 py-1 text-sm mt-4"
                title="Remove range"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {ranges.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            No custom time ranges added. Click "Add Custom Range" to create one.
          </div>
        )}
        
        <button
          type="button"
          onClick={addRange}
          className="btn btn-secondary text-sm mt-2"
        >
          + Add Custom Range
        </button>
      </div>

      {/* Range Summary */}
      {ranges.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-md text-sm">
          <div className="font-medium text-blue-900 mb-1">
            Time Range Summary:
          </div>
          <div className="text-blue-700">
            {ranges.length} range{ranges.length > 1 ? 's' : ''} selected
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeRangePicker;