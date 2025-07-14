"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import BurgerButton from "./components/BurgerButton";
import { useDocumentsStore } from "../stores/documentsStore";
import { StoreDemo } from "../components/StoreDemo";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedZoomLevel, setSelectedZoomLevel] = useState<"shallow" | "medium" | "deep">("shallow");
  
  // Use the documents store hook
  const documentsStore = useDocumentsStore();

  // Load initial data on component mount
  useEffect(() => {
    documentsStore.loadInitialData();
  }, [documentsStore.loadInitialData]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSectionSelect = async (categoryTitle: string, sectionTitle: string) => {
    await documentsStore.selectSection(categoryTitle, sectionTitle);
    // Reset zoom level to shallow when new content is selected
    setSelectedZoomLevel("shallow");
  };

  const handleRefreshData = async () => {
    await documentsStore.refreshData();
    setSelectedZoomLevel("shallow");
  };

  const handleZoomLevelChange = (level: "shallow" | "medium" | "deep") => {
    setSelectedZoomLevel(level);
  };

  // Get available zoom levels from current content
  const getAvailableZoomLevels = () => {
    if (!documentsStore.selectedContent) return [];
    return documentsStore.selectedContent.content.zoomLevels.map(level => ({
      value: level.level,
      label: level.level.charAt(0).toUpperCase() + level.level.slice(1)
    }));
  };

  // Show loading spinner for initial load
  if (documentsStore.isInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Loading Abstract Doc</h1>
          <p className="text-gray-600">Fetching documentation content...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (documentsStore.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2 text-red-600">Error Loading Content</h1>
          <p className="text-gray-600 mb-4">{documentsStore.error}</p>
          <button
            onClick={handleRefreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BurgerButton isOpen={isSidebarOpen} onClick={toggleSidebar} />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
        onSectionSelect={handleSectionSelect}
        documentationData={documentsStore.documentationData}
      />
      
      <div className="flex min-h-screen">     
        <div className="flex-1 transition-all duration-300">
          <div className="p-8 sm:p-20">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs and Zoom Level Switcher */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <nav className="text-sm text-gray-500">
                    {documentsStore.selectedContent ? `${documentsStore.selectedContent.categoryTitle} / ${documentsStore.selectedContent.sectionTitle}` : ''}
                  </nav>
                  
                  {/* Cache Status and Refresh Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRefreshData}
                      disabled={documentsStore.isInitialLoading}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors"
                      title="Refresh data (clears cache)"
                    >
                      <svg className={`w-3 h-3 ${documentsStore.isInitialLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      Cache: {documentsStore.cacheInfo.isValid ? '✅ Valid' : '❌ Invalid'}
                    </span>
                  </div>
                </div>
                
                {documentsStore.selectedContent && !documentsStore.isContentLoading && (
                  /* Zoom Level Switcher */
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">
                      Detail Level:
                    </label>
                    <div className="flex items-center">
                      {getAvailableZoomLevels().map((level, index) => (
                        <div key={level.value} className="flex items-center">
                          <div className="flex flex-col items-center">
                            <div className="text-xs font-medium text-gray-600 mb-1 h-4 flex items-center">
                              {selectedZoomLevel === level.value ? index + 1 : ''}
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                                selectedZoomLevel === level.value
                                  ? "bg-blue-600 border-blue-600"
                                  : "bg-white border-gray-300 hover:border-blue-400"
                              }`}
                              onClick={() => handleZoomLevelChange(level.value as "shallow" | "medium" | "deep")}
                            />
                          </div>
                          {index < getAvailableZoomLevels().length - 1 && (
                            <div className="w-16 h-0.5 bg-gray-300 mx-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {documentsStore.isContentLoading ? (
                // Loading state for content
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading content...</p>
                </div>
              ) : documentsStore.selectedContent ? (
                <>
                  {/* Header directly under breadcrumbs */}
                  <div className="text-center mb-12">
                    <h1 className="text-6xl font-bold">
                      {documentsStore.selectedContent.sectionTitle}
                    </h1>
                  </div>
                  
                  {/* Content under header */}
                  <div className="prose prose-lg max-w-none">
                    <p className="text-lg leading-relaxed text-justify">
                      {documentsStore.selectedContent.content.zoomLevels.find(level => level.level === selectedZoomLevel)?.text}
                    </p>
                  </div>
                </>
              ) : (
                // Fallback content
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">
                    Welcome to Abstract Doc
                  </h1>
                  <p className="text-lg text-gray-600">
                    No content available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Store Demo Panel (remove in production) */}
      <StoreDemo />
    </div>
  );
}
