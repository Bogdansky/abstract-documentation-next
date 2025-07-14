"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import BurgerButton from "./components/BurgerButton";
import learningContent from "../../mock_data/learning_content.json";

interface SelectedContent {
  categoryTitle: string;
  sectionTitle: string;
  content: {
    zoomLevels: {
      level: string;
      text: string;
    }[];
  };
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedZoomLevel, setSelectedZoomLevel] = useState<"shallow" | "medium" | "deep">("shallow");
  
  // Initialize with first section's first subsection by default
  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(() => {
    if (learningContent.length > 0 && learningContent[0].sections.length > 0) {
      const firstCategory = learningContent[0];
      const firstSection = firstCategory.sections[0];
      return {
        categoryTitle: firstCategory.title,
        sectionTitle: firstSection.title,
        content: firstSection.content
      };
    }
    return null;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSectionSelect = (categoryTitle: string, sectionTitle: string) => {
    // Find the selected content from learning_content.json
    const category = learningContent.find(cat => cat.title === categoryTitle);
    const section = category?.sections.find(sec => sec.title === sectionTitle);
    
    if (section) {
      setSelectedContent({
        categoryTitle,
        sectionTitle,
        content: section.content
      });
      // Reset zoom level to shallow when new content is selected
      setSelectedZoomLevel("shallow");
    }
  };

  const handleZoomLevelChange = (level: "shallow" | "medium" | "deep") => {
    setSelectedZoomLevel(level);
  };

  // Get available zoom levels from current content
  const getAvailableZoomLevels = () => {
    if (!selectedContent) return [];
    return selectedContent.content.zoomLevels.map(level => ({
      value: level.level,
      label: level.level.charAt(0).toUpperCase() + level.level.slice(1)
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <BurgerButton isOpen={isSidebarOpen} onClick={toggleSidebar} />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
        onSectionSelect={handleSectionSelect}
      />
      
      <div className="flex min-h-screen">     
        <div className="flex-1 transition-all duration-300">
          <div className="p-8 sm:p-20">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs and Zoom Level Switcher */}
              <div className="flex items-center justify-between mb-8">
                <nav className="text-sm text-gray-500">
                  {selectedContent ? `${selectedContent.categoryTitle} / ${selectedContent.sectionTitle}` : ''}
                </nav>
                
                {selectedContent && (
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
              
              {selectedContent ? (
                <>
                  {/* Header directly under breadcrumbs */}
                  <div className="text-center mb-12">
                    <h1 className="text-6xl font-bold">
                      {selectedContent.sectionTitle}
                    </h1>
                  </div>
                  
                  {/* Content under header */}
                  <div className="prose prose-lg max-w-none">
                    <p className="text-lg leading-relaxed text-justify">
                      {selectedContent.content.zoomLevels.find(level => level.level === selectedZoomLevel)?.text}
                    </p>
                  </div>
                </>
              ) : (
                // Fallback content
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">
                    Welcome to Abstract Doc
                  </h1>
                  <p className="text-lg">
                    Loading content...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
