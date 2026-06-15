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
          <span>{post.description || "General Knowledge"}</span>
          <span className="opacity-30">ID_{post.pageid}</span>
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
