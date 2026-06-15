// Native Wikipedia REST API Summary response type
export interface WikipediaSummary {
  pageid: number;
  title: string;
  displaytitle: string;
  extract: string;
  description?: string;
  content_urls?: {
    desktop: { page: string };
  };
}

export interface WikipediaRelatedResponse {
  pages: WikipediaSummary[];
}

export const wikipediaService = {
  async getRelated(title: string): Promise<WikipediaRelatedResponse> {
    try {
      const res = await fetch(`/api/wiki/related?title=${encodeURIComponent(title)}`);
      if (!res.ok) return { pages: [] };
      return res.json();
    } catch (e) {
      console.error("Internal API fetch failed:", e);
      return { pages: [] };
    }
  },
};
