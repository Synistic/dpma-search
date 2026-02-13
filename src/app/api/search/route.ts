import { NextRequest } from "next/server";
import Kernel from "@onkernel/sdk";
import { chromium } from "playwright-core";
import {
  searchDPMA,
  parseSearchResults,
  scrapeDetailPage,
} from "@/lib/scraper";
import type { DetailResult } from "@/lib/scraper";

export const maxDuration = 120;

function encodeSSE(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return Response.json({ error: "Suchbegriff fehlt" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(encodeSSE(event, data)));
      };

      const kernel = new Kernel();
      let browser: Awaited<ReturnType<typeof kernel.browsers.create>> | null =
        null;

      try {
        send("status", { message: "Cloud-Browser wird gestartet..." });

        browser = await kernel.browsers.create({ stealth: true });

        send("status", { message: "Verbinde mit Browser..." });

        const pw = await chromium.connectOverCDP(browser.cdp_ws_url, {
          timeout: 60000,
        });
        const context = pw.contexts()[0];
        if (!context) throw new Error("Kein Browser-Context");
        const page = context.pages()[0] ?? (await context.newPage());

        send("status", {
          message: `Suche nach "${query}" im DPMA-Register...`,
        });

        await searchDPMA(page, query.trim());
        const searchResults = await parseSearchResults(page);

        if (searchResults.length === 0) {
          send("status", { message: "Keine Treffer gefunden." });
          send("done", { results: [] });
          controller.close();
          await pw.close();
          return;
        }

        send("status", {
          message: `${searchResults.length} Treffer gefunden. Lade Details...`,
        });

        const details: DetailResult[] = [];

        for (let i = 0; i < searchResults.length; i++) {
          const result = searchResults[i];
          if (!result.detailUrl) continue;

          send("status", {
            message: `Lade Detailseite ${i + 1}/${searchResults.length}...`,
            progress: ((i + 1) / searchResults.length) * 100,
          });

          try {
            const detail = await scrapeDetailPage(page, result.detailUrl);
            details.push(detail);
            send("result", detail);
          } catch {
            details.push({
              aktenzeichen: result.aktenzeichen,
              anmeldetag: "",
              status: result.status,
              marke: result.marke,
              markenform: "",
              markenkategorie: "",
              inhaber: result.inhaber,
              inhaberAdresse: "",
              klassen: [],
              warenDienstleistungen: "",
            });
          }
        }

        await pw.close();
        send("done", { results: details });
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : String(err),
        });
      } finally {
        if (browser) {
          try {
            await kernel.browsers.deleteByID(browser.session_id);
          } catch {
            // ignore
          }
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
