import { NextRequest, NextResponse } from "next/server";

const ACTION_API_URL = "https://en.wikipedia.org/w/api.php";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  if (!title) {
    return NextResponse.json({ pages: [] }, { status: 400 });
  }

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `morelike:${title}`,
    gsrlimit: "10",
    prop: "extracts|description|info|pageprops",
    exintro: "1",
    explaintext: "1",
    exsentences: "3",
    inprop: "url",
    origin: "*",
  });

  try {
    const res = await fetch(`${ACTION_API_URL}?${params.toString()}`);
    if (!res.ok) throw new Error("Wikipedia API error");

    const data = (await res.json()) as any;
    if (!data.query || !data.query.pages) return NextResponse.json({ pages: [] });

    const pages = Object.values(data.query.pages).map((p: any) => ({
      pageid: p.pageid,
      title: p.title,
      displaytitle: p.title,
      extract: p.extract,
      description: p.description,
      content_urls: {
        desktop: { page: p.fullurl },
      },
    }));

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Proxy fetch failed:", error);
    return NextResponse.json({ pages: [] }, { status: 500 });
  }
}
