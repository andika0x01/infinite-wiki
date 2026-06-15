"use client";

import { useEffect, useRef, useState } from "react";
import { useKnowledgeGraph } from "@/hooks/useKnowledgeGraph";
import { WikiPost } from "./WikiPost";

export function Feed() {
  const { posts, isLoading, fetchMore } = useKnowledgeGraph();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // IntersectionObserver for tracking current active post (Smoother than onScroll)
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0", 10);
            setCurrentIndex(index);

            // Proactive fetch
            if (posts.length - index < 5) {
              fetchMore();
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5, // 50% visibility triggers the change
      }
    );

    return () => observerRef.current?.disconnect();
  }, [posts.length, fetchMore]);

  // Wheel interceptor for smooth slide snapping on Desktop
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
    // We don't set currentIndex manually here, the Observer will handle it smoothly

    container.scrollTo({
      top: index * container.clientHeight,
      behavior: "smooth",
    });

    // Reset scrolling flag after animation
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  return (
    <main ref={containerRef} className="feed-container">
      {isLoading && <div className="loading-bar" style={{ width: "100%" }} />}

      <nav className="fixed top-6 left-6 md:top-12 md:left-12 z-10 mix-blend-difference text-white font-mono text-sm md:text-base font-bold tracking-[0.3em] uppercase opacity-80">
        INFINITE WIKI
      </nav>

      <div className="fixed bottom-6 right-6 md:bottom-12 md:right-12 z-10 mix-blend-difference text-white font-mono text-[10px] flex flex-col items-end gap-3">
        <div className="flex flex-col items-end leading-none">
          <span className="opacity-40 uppercase tracking-widest mb-1 text-[8px] md:text-[10px]">Index</span>
          <span className="text-sm md:text-lg font-sans font-bold">{(currentIndex + 1).toString().padStart(2, "0")}</span>
        </div>
        <div className="w-px h-12 md:h-16 bg-white/20 relative">
          <div className="scroll-indicator-line"></div>
        </div>
      </div>

      {posts.map((post, index) => (
        <div
          key={`${post.pageid}-${index}`}
          data-index={index}
          ref={(el) => {
            if (el) observerRef.current?.observe(el);
          }}
        >
          <WikiPost post={post} />
        </div>
      ))}
    </main>
  );
}
