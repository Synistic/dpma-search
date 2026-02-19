import Kernel from "@onkernel/sdk";
import puppeteer from "puppeteer-core";
import { searchDPMA, parseSearchResults, scrapeDetailPage } from "./scraper.js";
import type { DetailResult } from "./scraper.js";

const kernel = new Kernel();

async function main() {
  const query = process.argv[2];
  if (!query) {
    console.error("Usage: bun run src/search.ts <suchbegriff>");
    process.exit(1);
  }

  console.log(`\nDPMA Markensuche: "${query}"`);
  console.log("━".repeat(50));
  console.log("Starte Kernel Cloud Browser...\n");

  let browser: Awaited<ReturnType<typeof kernel.browsers.create>> | null = null;

  try {
    // Kernel Browser erstellen mit Stealth
    browser = await kernel.browsers.create({
      stealth: true,
    });

    const cdpUrl = browser.cdp_ws_url;
    console.log("Browser erstellt. Verbinde via CDP...");

    // Puppeteer über CDP verbinden
    const pw = await puppeteer.connect({ browserWSEndpoint: cdpUrl });
    const pages = await pw.pages();
    const page = pages[0] ?? (await pw.newPage());

    // DPMA durchsuchen
    console.log(`Suche nach "${query}" im DPMA-Register...\n`);
    await searchDPMA(page, query);

    // Ergebnisse parsen
    const searchResults = await parseSearchResults(page);

    if (searchResults.length === 0) {
      console.log("Keine Treffer gefunden.");
      await pw.close();
      return;
    }

    console.log(`${searchResults.length} Treffer gefunden.\n`);

    // Detailseiten scrapen
    const details: DetailResult[] = [];

    for (let i = 0; i < searchResults.length; i++) {
      const result = searchResults[i];
      if (!result.detailUrl) {
        console.log(
          `Treffer ${i + 1}: ${result.marke || result.aktenzeichen} - Keine Detailseite verfügbar`
        );
        continue;
      }

      console.log(
        `Lade Detailseite ${i + 1}/${searchResults.length}: ${result.aktenzeichen || result.marke}...`
      );

      try {
        const detail = await scrapeDetailPage(page, result.detailUrl);
        details.push(detail);
      } catch (err) {
        console.error(
          `  Fehler bei Detailseite: ${err instanceof Error ? err.message : String(err)}`
        );
        // Basisdaten als Fallback
        details.push({
          aktenzeichen: result.aktenzeichen,
          anmeldetag: "",
          status: result.status,
          marke: result.marke,
          markenform: "",
          markenkategorie: "",
          inhaber: result.inhaber,
          inhaberAdresse: "",
          klassen: result.klassen.map((c) => ({
            classNumber: c,
            description: "",
          })),
          warenDienstleistungen: "",
        });
      }
    }

    await pw.close();

    // Formatierte Ausgabe
    console.log("\n");
    console.log(`DPMA Markensuche: "${query}"`);
    console.log("━".repeat(50));

    for (let i = 0; i < details.length; i++) {
      const d = details[i];
      console.log(
        `\nTreffer ${i + 1}: ${d.marke || d.aktenzeichen || "Unbekannt"}`
      );
      if (d.aktenzeichen)
        console.log(`  Aktenzeichen:    ${d.aktenzeichen}`);
      if (d.markenform) console.log(`  Markenform:      ${d.markenform}`);
      if (d.status) console.log(`  Status:          ${d.status}`);
      if (d.anmeldetag) console.log(`  Anmeldetag:      ${d.anmeldetag}`);
      if (d.inhaber) {
        const inhaberLine = d.inhaberAdresse
          ? `${d.inhaber}, ${d.inhaberAdresse}`
          : d.inhaber;
        console.log(`  Inhaber:         ${inhaberLine}`);
      }

      if (d.klassen.length > 0) {
        console.log("\n  Nizza-Klassen:");
        for (const k of d.klassen) {
          console.log(`    ${k.classNumber} - ${k.description}`);
        }
      }

      if (d.warenDienstleistungen) {
        console.log(`\n  Waren/Dienstleistungen:`);
        console.log(`    ${d.warenDienstleistungen}`);
      }

      console.log("\n" + "━".repeat(50));
    }

    // JSON-Ausgabe für programmatische Nutzung
    if (process.argv.includes("--json")) {
      console.log("\n--- JSON ---");
      console.log(JSON.stringify(details, null, 2));
    }
  } catch (err) {
    console.error(
      `Fehler: ${err instanceof Error ? err.message : String(err)}`
    );
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  } finally {
    // Browser aufräumen
    if (browser) {
      try {
        await kernel.browsers.deleteByID(browser.session_id);
        console.log("\nBrowser aufgeräumt.");
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

main();
