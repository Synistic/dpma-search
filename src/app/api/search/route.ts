import { NextRequest } from "next/server";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body?.query;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return Response.json({ error: "Suchbegriff fehlt" }, { status: 400 });
    }

    // Step 2: Test imports
    const steps: string[] = [];

    steps.push("importing @onkernel/sdk...");
    const Kernel = (await import("@onkernel/sdk")).default;
    steps.push("@onkernel/sdk OK");

    steps.push("importing puppeteer-core...");
    const puppeteer = (await import("puppeteer-core")).default;
    steps.push("puppeteer-core OK");

    steps.push("creating kernel instance...");
    const kernel = new Kernel();
    steps.push("kernel instance OK");

    steps.push("creating browser...");
    const browser = await kernel.browsers.create({ stealth: true });
    steps.push(`browser OK: ${browser.cdp_ws_url?.slice(0, 30)}...`);

    steps.push("connecting puppeteer...");
    const pw = await puppeteer.connect({ browserWSEndpoint: browser.cdp_ws_url });
    steps.push("puppeteer connected OK");

    const pages = await pw.pages();
    steps.push(`pages: ${pages.length}`);

    await pw.close();
    await kernel.browsers.deleteByID(browser.session_id);
    steps.push("cleanup OK");

    return Response.json({ debug: true, steps, query });
  } catch (err) {
    return Response.json(
      {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
