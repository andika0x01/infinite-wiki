# Infinite Wiki

Infinite Wiki is a modern, infinite-scrolling knowledge exploration application. It presents Wikipedia articles in an engaging, feed-like interface with smooth slide snapping, allowing users to seamlessly discover new information. The application is built for high performance and deployed to Cloudflare Edge using OpenNext.

## Key Features

- **Infinite Scroll Feed:** Seamlessly explore a continuous stream of Wikipedia articles.
- **Smooth Slide Snapping:** Engaging, TikTok-style vertical feed navigation.
- **Wikipedia API Integration:** Dynamically fetches related knowledge graph articles.
- **Edge Optimized:** Runs on Cloudflare Workers/Pages for ultra-low latency worldwide.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org)
- **UI Library:** [React 19](https://react.dev)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **Deployment:** [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js
- npm or your preferred package manager

### Installation

1. Clone the repository and navigate to the project directory.
2. Install the dependencies:

```bash
npm install
```

### Development

Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application. The page auto-updates as you edit the source files.

## Deployment

The application is configured to be deployed to Cloudflare using OpenNext.

To build and deploy the application to Cloudflare, run:

```bash
npm run deploy
```

You can also preview the Cloudflare build locally by running:

```bash
npm run preview
```

## Project Structure

- `src/app/`: Next.js App Router configuration and main entry points.
- `src/components/`: Reusable React components (e.g., `Feed.tsx`, `WikiPost.tsx`).
- `src/hooks/`: Custom React hooks, including knowledge graph logic (`useKnowledgeGraph.ts`).
- `src/services/`: External API integrations (`wikipedia.ts`).
