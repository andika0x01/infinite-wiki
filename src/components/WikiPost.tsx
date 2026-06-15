"use client";

import { useState } from "react";
import { WikipediaSummary } from "@/services/wikipedia";

interface WikiPostProps {
  post: WikipediaSummary;
}

export function WikiPost({ post }: WikiPostProps) {
  return (
    <article className="wiki-post group">
      <div className="wiki-content">
        <div className="wiki-meta animate-in">
          <span className="bg-foreground text-background px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-xs">
            {post.description?.toUpperCase() || "GENERAL KNOWLEDGE"}
          </span>
          <span className="font-mono text-[10px] opacity-30 tracking-tighter">REF_{post.pageid}</span>
        </div>
        <h1 className="wiki-header animate-in delay-1" dangerouslySetInnerHTML={{ __html: post.displaytitle }} />
        <div className="wiki-body-container animate-in delay-2">
          <div className="wiki-body">{post.extract}</div>
        </div>
        <footer className="wiki-footer animate-in delay-3">
          <a href={post.content_urls?.desktop.page} target="_blank" rel="noopener noreferrer" className="source-link">
            Wiki Source ↗
          </a>
        </footer>
      </div>
    </article>
  );
}
