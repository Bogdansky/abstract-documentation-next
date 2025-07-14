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

/**
 * Simple in-memory store for caching documentation data
 */
class DocumentsStore {
  private data: Category[] | null = null;
  private isLoading: boolean = false;
  private lastFetchTime: number | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(): boolean {
    if (!this.data || !this.lastFetchTime) {
      return false;
    }
    return Date.now() - this.lastFetchTime < this.CACHE_DURATION;
  }

  /**
   * Get cached data if available and valid
   */
  getCachedData(): Category[] | null {
    return this.isCacheValid() ? this.data : null;
  }

  /**
   * Store data in cache with timestamp
   */
  setData(data: Category[]): void {
    this.data = data;
    this.lastFetchTime = Date.now();
  }

  /**
   * Check if data is currently being loaded
   */
  getIsLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Set loading state
   */
  setIsLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  /**
   * Clear cached data (useful for forced refresh)
   */
  clearCache(): void {
    this.data = null;
    this.lastFetchTime = null;
  }

  /**
   * Get cache info for debugging
   */
  getCacheInfo() {
    return {
      hasData: !!this.data,
      isValid: this.isCacheValid(),
      lastFetch: this.lastFetchTime ? new Date(this.lastFetchTime).toISOString() : null,
      isLoading: this.isLoading
    };
  }
}

class DocumentsService {
  private store = new DocumentsStore();

  /**
   * Simulates fetching documentation data from an API
   * Includes a delay to simulate network latency
   * Uses caching to avoid repeated fetches
   */
  async fetchDocumentationData(): Promise<DocumentationData> {
    // Check if we have valid cached data
    const cachedData = this.store.getCachedData();
    if (cachedData) {
      console.log('📦 Returning cached documentation data');
      return { categories: cachedData };
    }

    // If already loading, wait for the current request to complete
    if (this.store.getIsLoading()) {
      console.log('⏳ Waiting for ongoing fetch to complete...');
      // Poll until loading is complete
      while (this.store.getIsLoading()) {
        await this.delay(100);
      }
      const freshData = this.store.getCachedData();
      if (freshData) {
        return { categories: freshData };
      }
    }

    // Set loading state
    this.store.setIsLoading(true);

    try {
      console.log('🌐 Fetching fresh documentation data...');
      // Simulate API delay
      await this.delay(1500);

      // Dynamically import the mock data to simulate API response
      const learningContent = await import('../../mock_data/learning_content.json');
      const data = learningContent.default;

      // Store in cache
      this.store.setData(data);
      
      console.log('✅ Documentation data fetched and cached successfully');
      return { categories: data };
    } finally {
      // Always clear loading state
      this.store.setIsLoading(false);
    }
  }

  /**
   * Get a specific section by category and section title
   */
  async getSection(categoryTitle: string, sectionTitle: string): Promise<SelectedContent | null> {
    const data = await this.fetchDocumentationData();
    
    const category = data.categories.find(cat => cat.title === categoryTitle);
    const section = category?.sections.find(sec => sec.title === sectionTitle);
    
    if (section) {
      return {
        categoryTitle,
        sectionTitle,
        content: section.content
      };
    }
    
    return null;
  }

  /**
   * Get the first available section (for initial load)
   */
  async getDefaultSection(): Promise<SelectedContent | null> {
    const data = await this.fetchDocumentationData();
    
    if (data.categories.length > 0 && data.categories[0].sections.length > 0) {
      const firstCategory = data.categories[0];
      const firstSection = firstCategory.sections[0];
      
      return {
        categoryTitle: firstCategory.title,
        sectionTitle: firstSection.title,
        content: firstSection.content
      };
    }
    
    return null;
  }

  /**
   * Utility method to simulate API delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Force refresh the documentation data (clears cache and fetches fresh data)
   */
  async refreshDocumentationData(): Promise<DocumentationData> {
    console.log('🔄 Force refreshing documentation data...');
    this.store.clearCache();
    return this.fetchDocumentationData();
  }

  /**
   * Get cache information for debugging purposes
   */
  getCacheInfo() {
    return this.store.getCacheInfo();
  }

  /**
   * Check if data is currently being loaded
   */
  isLoading(): boolean {
    return this.store.getIsLoading();
  }

  /**
   * Clear the cache manually
   */
  clearCache(): void {
    console.log('🗑️ Clearing documentation cache...');
    this.store.clearCache();
  }
}

// Export singleton instance
export const documentsService = new DocumentsService();
export default documentsService;