import { useState, useEffect, useCallback } from 'react';

// Re-export types from services for convenience
export interface ZoomLevel {
  level: string;
  text: string;
}

export interface Section {
  title: string;
  content: {
    zoomLevels: ZoomLevel[];
  };
}

export interface Category {
  title: string;
  sections: Section[];
}

export interface DocumentationData {
  categories: Category[];
}

export interface SelectedContent {
  categoryTitle: string;
  sectionTitle: string;
  content: {
    zoomLevels: ZoomLevel[];
  };
}

interface DocumentsStoreState {
  // Data state
  documentationData: DocumentationData | null;
  selectedContent: SelectedContent | null;
  
  // Loading states
  isInitialLoading: boolean;
  isContentLoading: boolean;
  
  // Cache info
  cacheInfo: {
    hasData: boolean;
    isValid: boolean;
    lastFetch: string | null;
    isLoading: boolean;
  };
  
  // Error state
  error: string | null;
}

interface DocumentsStoreActions {
  // Data operations
  loadInitialData: () => Promise<void>;
  selectSection: (categoryTitle: string, sectionTitle: string) => Promise<void>;
  refreshData: () => Promise<void>;
  clearCache: () => void;
  
  // Utility
  updateCacheInfo: () => void;
}

export interface DocumentsStore extends DocumentsStoreState, DocumentsStoreActions {}

// In-memory cache (singleton across the app)
class DocumentsCache {
  private data: Category[] | null = null;
  private isLoading: boolean = false;
  private lastFetchTime: number | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private isCacheValid(): boolean {
    if (!this.data || !this.lastFetchTime) {
      return false;
    }
    return Date.now() - this.lastFetchTime < this.CACHE_DURATION;
  }

  getCachedData(): Category[] | null {
    return this.isCacheValid() ? this.data : null;
  }

  setData(data: Category[]): void {
    this.data = data;
    this.lastFetchTime = Date.now();
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  setIsLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  clearCache(): void {
    this.data = null;
    this.lastFetchTime = null;
  }

  getCacheInfo() {
    return {
      hasData: !!this.data,
      isValid: this.isCacheValid(),
      lastFetch: this.lastFetchTime ? new Date(this.lastFetchTime).toISOString() : null,
      isLoading: this.isLoading
    };
  }

  async fetchData(): Promise<Category[]> {
    // Check if we have valid cached data
    const cachedData = this.getCachedData();
    if (cachedData) {
      console.log('📦 Returning cached documentation data');
      return cachedData;
    }

    // If already loading, wait for the current request to complete
    if (this.getIsLoading()) {
      console.log('⏳ Waiting for ongoing fetch to complete...');
      // Poll until loading is complete
      while (this.getIsLoading()) {
        await this.delay(100);
      }
      const freshData = this.getCachedData();
      if (freshData) {
        return freshData;
      }
    }

    // Set loading state
    this.setIsLoading(true);

    try {
      console.log('🌐 Fetching fresh documentation data...');
      // Simulate API delay
      await this.delay(1500);

      // Dynamically import the mock data to simulate API response
      const learningContent = await import('../../mock_data/learning_content.json');
      const data = learningContent.default as Category[];

      // Store in cache
      this.setData(data);
      
      console.log('✅ Documentation data fetched and cached successfully');
      return data;
    } finally {
      // Always clear loading state
      this.setIsLoading(false);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton cache instance
const documentsCache = new DocumentsCache();

/**
 * Custom hook for managing documents store state
 */
export function useDocumentsStore(): DocumentsStore {
  const [state, setState] = useState<DocumentsStoreState>({
    documentationData: null,
    selectedContent: null,
    isInitialLoading: false,
    isContentLoading: false,
    cacheInfo: documentsCache.getCacheInfo(),
    error: null,
  });

  // Update cache info
  const updateCacheInfo = useCallback(() => {
    setState(prev => ({
      ...prev,
      cacheInfo: documentsCache.getCacheInfo()
    }));
  }, []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isInitialLoading: true, error: null }));
      console.log('🚀 Starting initial data load...');
      console.log('Cache info before fetch:', documentsCache.getCacheInfo());
      
      const categories = await documentsCache.fetchData();
      const documentationData: DocumentationData = { categories };
      
      // Get default content (first section of first category)
      let selectedContent: SelectedContent | null = null;
      if (categories.length > 0 && categories[0].sections.length > 0) {
        const firstCategory = categories[0];
        const firstSection = firstCategory.sections[0];
        selectedContent = {
          categoryTitle: firstCategory.title,
          sectionTitle: firstSection.title,
          content: firstSection.content
        };
      }
      
      console.log('Cache info after fetch:', documentsCache.getCacheInfo());
      setState(prev => ({
        ...prev,
        documentationData,
        selectedContent,
        isInitialLoading: false,
        cacheInfo: documentsCache.getCacheInfo()
      }));
    } catch (error) {
      console.error('Failed to load documentation data:', error);
      setState(prev => ({
        ...prev,
        isInitialLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
        cacheInfo: documentsCache.getCacheInfo()
      }));
    }
  }, []);

  // Select a specific section
  const selectSection = useCallback(async (categoryTitle: string, sectionTitle: string) => {
    try {
      setState(prev => ({ ...prev, isContentLoading: true, error: null }));
      console.log('📄 Loading section:', categoryTitle, '/', sectionTitle);
      
      // Ensure we have data
      const categories = await documentsCache.fetchData();
      
      const category = categories.find(cat => cat.title === categoryTitle);
      const section = category?.sections.find(sec => sec.title === sectionTitle);
      
      if (section) {
        const selectedContent: SelectedContent = {
          categoryTitle,
          sectionTitle,
          content: section.content
        };
        
        setState(prev => ({
          ...prev,
          selectedContent,
          isContentLoading: false,
          cacheInfo: documentsCache.getCacheInfo()
        }));
      } else {
        throw new Error(`Section not found: ${categoryTitle}/${sectionTitle}`);
      }
    } catch (error) {
      console.error('Failed to load section:', error);
      setState(prev => ({
        ...prev,
        isContentLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load section',
        cacheInfo: documentsCache.getCacheInfo()
      }));
    }
  }, []);

  // Refresh data (clear cache and reload)
  const refreshData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isInitialLoading: true, error: null }));
      console.log('🔄 Force refreshing documentation data...');
      
      documentsCache.clearCache();
      const categories = await documentsCache.fetchData();
      const documentationData: DocumentationData = { categories };
      
      // Reset to default content
      let selectedContent: SelectedContent | null = null;
      if (categories.length > 0 && categories[0].sections.length > 0) {
        const firstCategory = categories[0];
        const firstSection = firstCategory.sections[0];
        selectedContent = {
          categoryTitle: firstCategory.title,
          sectionTitle: firstSection.title,
          content: firstSection.content
        };
      }
      
      setState(prev => ({
        ...prev,
        documentationData,
        selectedContent,
        isInitialLoading: false,
        cacheInfo: documentsCache.getCacheInfo()
      }));
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setState(prev => ({
        ...prev,
        isInitialLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        cacheInfo: documentsCache.getCacheInfo()
      }));
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    console.log('🗑️ Clearing documentation cache...');
    documentsCache.clearCache();
    setState(prev => ({
      ...prev,
      cacheInfo: documentsCache.getCacheInfo()
    }));
  }, []);

  // Auto-update cache info periodically
  useEffect(() => {
    const interval = setInterval(updateCacheInfo, 1000);
    return () => clearInterval(interval);
  }, [updateCacheInfo]);

  return {
    // State
    ...state,
    
    // Actions
    loadInitialData,
    selectSection,
    refreshData,
    clearCache,
    updateCacheInfo,
  };
}
