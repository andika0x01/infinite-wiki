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
  const postsRef = useRef<WikipediaSummary[]>([]);

  // Sync refs with state for synchronous access in fetchMore
  useEffect(() => {
    postsCountRef.current = posts.length;
    postsRef.current = posts;
  }, [posts]);

  const fetchMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      let seedTitle = "";

      // Get a seed from existing posts or interests
      if (postsRef.current.length === 0) {
        seedTitle = INTERESTS[Math.floor(Math.random() * INTERESTS.length)];
      } else {
        // Pick a seed from the last few posts to maintain context
        const recent = postsRef.current.slice(-10);
        const randomPost = recent[Math.floor(Math.random() * recent.length)];
        seedTitle = randomPost?.title || INTERESTS[Math.floor(Math.random() * INTERESTS.length)];
      }

      const actualSeed = seedTitle || INTERESTS[Math.floor(Math.random() * INTERESTS.length)];
      const relatedData = await wikipediaService.getRelated(actualSeed);

      // Deduplicate using a Set for the current batch
      const currentBatchIds = new Set<number>();

      let newArticles = relatedData.pages.filter((p) => {
        if (historyRef.current.has(p.pageid) || currentBatchIds.has(p.pageid)) return false;
        if (!p.extract || p.extract.length <= 50) return false;
        currentBatchIds.add(p.pageid);
        return true;
      });

      // If topic branch is dry, pick a fresh random interest
      if (newArticles.length < 3) {
        const fallbackSeed = INTERESTS[Math.floor(Math.random() * INTERESTS.length)];
        const fallbackData = await wikipediaService.getRelated(fallbackSeed);
        const fallbackArticles = fallbackData.pages.filter((p) => {
          if (historyRef.current.has(p.pageid) || currentBatchIds.has(p.pageid)) return false;
          if (!p.extract) return false;
          currentBatchIds.add(p.pageid);
          return true;
        });
        newArticles = [...newArticles, ...fallbackArticles];
      }

      const batch = newArticles.slice(0, 10);
      batch.forEach((p) => historyRef.current.add(p.pageid));

      if (batch.length > 0) {
        setPosts((prev) => [...prev, ...batch]);
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
