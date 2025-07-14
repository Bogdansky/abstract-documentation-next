import React from 'react';
import { useDocumentsStore } from '../stores/documentsStore';

/**
 * Demo component to showcase store functionality
 * This can be added to any page to see store state and actions
 */
export function StoreDemo() {
  const store = useDocumentsStore();

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm border">
      <h3 className="font-bold text-sm mb-2">📊 Store Debug Panel</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-semibold">Status:</span>
          <div className="ml-2">
            <div>Initial Loading: {store.isInitialLoading ? '⏳' : '✅'}</div>
            <div>Content Loading: {store.isContentLoading ? '⏳' : '✅'}</div>
            <div>Error: {store.error ? '❌' : '✅'}</div>
          </div>
        </div>
        
        <div>
          <span className="font-semibold">Cache:</span>
          <div className="ml-2">
            <div>Valid: {store.cacheInfo.isValid ? '✅' : '❌'}</div>
            <div>Has Data: {store.cacheInfo.hasData ? '✅' : '❌'}</div>
            <div>Loading: {store.cacheInfo.isLoading ? '⏳' : '✅'}</div>
            {store.cacheInfo.lastFetch && (
              <div>Last Fetch: {new Date(store.cacheInfo.lastFetch).toLocaleTimeString()}</div>
            )}
          </div>
        </div>
        
        <div>
          <span className="font-semibold">Data:</span>
          <div className="ml-2">
            <div>Categories: {store.documentationData?.categories.length || 0}</div>
            <div>Selected: {store.selectedContent ? '✅' : '❌'}</div>
          </div>
        </div>
        
        <div className="flex gap-1 mt-3">
          <button
            onClick={store.refreshData}
            disabled={store.isInitialLoading}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs disabled:bg-gray-300"
          >
            Refresh
          </button>
          <button
            onClick={store.clearCache}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
}
