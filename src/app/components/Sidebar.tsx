"use client";

import { useState } from "react";
import learningContent from "../../../mock_data/learning_content.json";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSectionSelect: (categoryTitle: string, sectionTitle: string) => void;
}

export default function Sidebar({ isOpen, onClose, onSectionSelect }: SidebarProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (sectionIndex: number) => {
    setExpandedSection(expandedSection === sectionIndex ? null : sectionIndex);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out z-[110] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 h-full`}
      >
        <div className="p-6 pt-20">
          <h2 className="text-white text-xl font-semibold mb-6">Menu</h2>
          <nav>
            <ul className="space-y-1">
              {learningContent.map((category, index) => (
                <li key={index}>
                  {/* Main Category */}
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full text-left flex items-center justify-between px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    <span>{category.title}</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-200 ${
                        expandedSection === index ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Sections */}
                  {expandedSection === index && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {category.sections.map((section, sectionIndex) => (
                        <li key={sectionIndex}>
                          <button
                            onClick={() => {
                              onSectionSelect(category.title, section.title);
                              onClose();
                            }}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200"
                          >
                            {section.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}