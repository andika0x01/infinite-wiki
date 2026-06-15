import { useState, useCallback, useRef, useEffect } from "react";
import { wikipediaService, WikipediaSummary } from "@/services/wikipedia";

const INTERESTS = [
  "Mathematics",
  "Physics",
  "Philosophy",
  "Economics",
  "Computer science",
  "Machine learning",
  "Artificial intelligence",
  "Quantum mechanics",
  "Epistemology",
  "Macroeconomics",
  "Calculus",
  "Theoretical physics",
  "Existentialism",
  "Algorithms",
  "Neural networks",
  "Behavioral economics",
];

export function useKnowledgeGraph() {
  const [posts, setPosts] = useState<WikipediaSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const historyRef = useRef<Set<number>>(new Set());
  const postsCountRef = useRef(0);

  // Sync ref with state
  useEffect(() => {
    postsCountRef.current = posts.length;
  }, [posts]);

  const fetchMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      let seedTitle = "";

      // Get a seed from existing posts or interests
      if (postsCountRef.current === 0) {
        seedTitle = INTERESTS[Math.floor(Math.random() * INTERESTS.length)];
      } else {
        // Try to pick a seed from the last few posts to keep context
        // Use a functional update or the ref to avoid stale closure
        setPosts((current) => {
          const recent = current.slice(-10);
          const randomPost = recent[Math.floor(Math.random() * recent.length)];
          seedTitle = randomPost?.title || INTERESTS[Math.floor(Math.random() * INTERESTS.length)];
          return current;
        });
      }

      const actualSeed = seedTitle || INTERESTS[Math.floor(Math.random() * INTERESTS.length)];
      const relatedData = await wikipediaService.getRelated(actualSeed);

      let newArticles = relatedData.pages.filter((p) => !historyRef.current.has(p.pageid) && p.extract && p.extract.length > 50);

      // If topic branch is dry, pick a fresh random interest
      if (newArticles.length < 3) {
        const fallbackSeed = INTERESTS[Math.floor(Math.random() * INTERESTS.length)];
        const fallbackData = await wikipediaService.getRelated(fallbackSeed);
        const fallbackArticles = fallbackData.pages.filter((p) => !historyRef.current.has(p.pageid) && p.extract);
        newArticles = [...newArticles, ...fallbackArticles];
      }

      const batch = newArticles.slice(0, 10);
      batch.forEach((p) => historyRef.current.add(p.pageid));

      if (batch.length > 0) {
        setPosts((prev) => [...prev, ...batch]);
      } else {
        // Absolute fallback if everything fails: fetch a random summary
        // (This part can be extended if needed)
      }
    } catch (error) {
      console.error("Knowledge Graph fetch failed:", error);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (postsCountRef.current === 0 && !loadingRef.current) {
      fetchMore();
    }
  }, [fetchMore]);

  return { posts, isLoading, fetchMore };
}
