"use client";

import { useEffect, useRef, useState } from "react";
import { useKnowledgeGraph } from "@/hooks/useKnowledgeGraph";
import { WikiPost } from "./WikiPost";

export function Feed() {
  const { posts, isLoading, fetchMore } = useKnowledgeGraph();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Wheel interceptor for smooth slide snapping
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Allow internal scrolling for content areas
      const target = e.target as HTMLElement;
      const scrollableParent = target.closest(".wiki-body-container");

      if (scrollableParent) {
        const isAtTop = scrollableParent.scrollTop === 0;
        const isAtBottom = Math.abs(scrollableParent.scrollHeight - scrollableParent.clientHeight - scrollableParent.scrollTop) < 1;

        if ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop)) {
          return;
        }
      }

      e.preventDefault();
      if (isScrollingRef.current) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(posts.length - 1, currentIndex + direction));

      if (nextIndex !== currentIndex) {
        scrollToIndex(nextIndex);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [currentIndex, posts.length]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    isScrollingRef.current = true;
    setCurrentIndex(index);

    // Trigger proactive fetch here because handleScroll is blocked by isScrollingRef lock
    if (posts.length - index < 5) {
      fetchMore();
    }

    container.scrollTo({
      top: index * container.clientHeight,
      behavior: "smooth",
    });

    // Reset scrolling flag after animation
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    // For touch devices where handleWheel is not used
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (!isScrollingRef.current && index !== currentIndex) {
      setCurrentIndex(index);
    }

    if (posts.length - index < 5) {
      fetchMore();
    }
  };

  return (
    <main ref={containerRef} className="feed-container" onScroll={handleScroll}>
      {isLoading && <div className="loading-bar" style={{ width: "100%" }} />}

      <nav className="fixed top-8 left-8 md:top-12 md:left-12 z-10 mix-blend-difference text-white font-mono text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase opacity-80">
        INFINITE WIKI
      </nav>

      <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-10 mix-blend-difference text-white font-mono text-[10px] flex flex-col items-end gap-3">
        <div className="flex flex-col items-end leading-none">
          <span className="opacity-40 uppercase tracking-widest mb-1 text-[8px] md:text-[10px]">Index</span>
          <span className="text-sm md:text-lg font-sans font-bold">{(currentIndex + 1).toString().padStart(2, "0")}</span>
        </div>
        <div className="w-px h-12 md:h-16 bg-white/20 relative">
          <div className="scroll-indicator-line"></div>
        </div>
      </div>

      {posts.map((post, index) => (
        <WikiPost key={`${post.pageid}-${index}`} post={post} />
      ))}
    </main>
  );
}
