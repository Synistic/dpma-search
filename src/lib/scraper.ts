import type { Page } from "puppeteer-core";
import { enrichNizzaClasses } from "./nizza";

export interface SearchResult {
  aktenzeichen: string;
  marke: string;
  status: string;
  inhaber: string;
  klassen: number[];
  detailUrl: string;
}

export interface DetailResult {
  aktenzeichen: string;
  anmeldetag: string;
  status: string;
  marke: string;
  markenform: string;
  markenkategorie: string;
  inhaber: string;
  inhaberAdresse: string;
  klassen: { classNumber: number; description: string }[];
  warenDienstleistungen: string;
}

const DPMA_BASE = "https://register.dpma.de/DPMAregister/marke/basis";

export async function searchDPMA(page: Page, query: string): Promise<void> {
  await page.goto(DPMA_BASE, { waitUntil: "networkidle0", timeout: 30000 });

  // Suchfeld "Marke" ausfüllen
  await page.evaluate((q) => {
    (document.querySelector('input#marke[type="text"]') as HTMLInputElement).value = q;
  }, query);

  // "Recherche starten" Button klicken
  await page.click('input#rechercheStarten');

  // Warten auf Ergebnisse
  await page.waitForNetworkIdle({ idleTime: 1000 });
  await new Promise((r) => setTimeout(r, 3000));
}

export async function parseSearchResults(page: Page): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  // Ergebnisse aus der Seite extrahieren via JavaScript im Browser
  const data = await page.evaluate(() => {
    const items: {
      aktenzeichen: string;
      marke: string;
      status: string;
      inhaber: string;
      klassen: string;
      detailUrl: string;
    }[] = [];

    // DPMA zeigt Ergebnisse in divs oder Tabellen
    // Suche nach allen Links die auf Registeransicht zeigen
    const links = document.querySelectorAll('a[href*="marke/register"]');

    if (links.length > 0) {
      // Links zu Detailseiten gefunden
      for (const link of links) {
        const href = (link as HTMLAnchorElement).href;
        const text = link.textContent?.trim() ?? "";
        // Nur Links die wie Aktenzeichen aussehen oder Markennamen sind
        if (href && !items.some((i) => i.detailUrl === href)) {
          items.push({
            aktenzeichen: text,
            marke: text,
            status: "",
            inhaber: "",
            klassen: "",
            detailUrl: href,
          });
        }
      }
      return items;
    }

    // Alternative: Tabellen-Rows
    const rows = document.querySelectorAll("table tbody tr");
    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length < 2) continue;

      const link = row.querySelector("a") as HTMLAnchorElement | null;
      const cellTexts = Array.from(cells).map(
        (c) => c.textContent?.trim() ?? ""
      );

      items.push({
        aktenzeichen: cellTexts[0] ?? "",
        marke: cellTexts[1] ?? cellTexts[0] ?? "",
        status: cellTexts[2] ?? "",
        inhaber: cellTexts[3] ?? "",
        klassen: cellTexts[4] ?? "",
        detailUrl: link?.href ?? "",
      });
    }

    return items;
  });

  for (const item of data) {
    if (!item.detailUrl && !item.aktenzeichen) continue;
    results.push({
      aktenzeichen: item.aktenzeichen,
      marke: item.marke,
      status: item.status,
      inhaber: item.inhaber,
      klassen: parseKlassen(item.klassen),
      detailUrl: item.detailUrl,
    });
  }

  // Wenn keine strukturierten Ergebnisse: versuche Matrix-Ansicht zu parsen
  if (results.length === 0) {
    const matrixData = await page.evaluate(() => {
      const items: {
        aktenzeichen: string;
        marke: string;
        detailUrl: string;
      }[] = [];

      // Matrix-Karten
      const cards = document.querySelectorAll(
        ".dpma-matrixcard, .card, [class*=matrix], [class*=treffer]"
      );
      for (const card of cards) {
        const link = card.querySelector("a") as HTMLAnchorElement | null;
        const text = card.textContent?.trim() ?? "";
        if (link?.href) {
          items.push({
            aktenzeichen: text.slice(0, 100),
            marke: link.textContent?.trim() ?? "",
            detailUrl: link.href,
          });
        }
      }

      // Fallback: Alle Links auf der Seite die register enthalten
      if (items.length === 0) {
        const allLinks = document.querySelectorAll("a");
        for (const link of allLinks) {
          const href = link.href;
          if (
            href.includes("register") &&
            href.includes("marke") &&
            !href.includes("basis") &&
            !href.includes("javascript")
          ) {
            items.push({
              aktenzeichen: link.textContent?.trim() ?? "",
              marke: link.textContent?.trim() ?? "",
              detailUrl: href,
            });
          }
        }
      }

      return items;
    });

    for (const item of matrixData) {
      if (!item.detailUrl) continue;
      results.push({
        aktenzeichen: item.aktenzeichen,
        marke: item.marke,
        status: "",
        inhaber: "",
        klassen: [],
        detailUrl: item.detailUrl,
      });
    }
  }

  return results;
}

export async function scrapeDetailPage(
  page: Page,
  url: string
): Promise<DetailResult> {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  const result: DetailResult = {
    aktenzeichen: "",
    anmeldetag: "",
    status: "",
    marke: "",
    markenform: "",
    markenkategorie: "",
    inhaber: "",
    inhaberAdresse: "",
    klassen: [],
    warenDienstleistungen: "",
  };

  // DPMA Detailseite hat eine 4-Spalten-Tabelle: INID | Kriterium | Feld | Inhalt
  const extracted = await page.evaluate(() => {
    const data: Record<string, string> = {};
    const fieldData: Record<string, string> = {};

    const rows = document.querySelectorAll("table tr");
    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 4) {
        // Spalte 0: INID (z.B. "210"), Spalte 1: Kriterium, Spalte 2: Feld-Kürzel, Spalte 3: Inhalt
        const inid = cells[0].textContent?.trim() ?? "";
        const kriterium = cells[1].textContent?.trim() ?? "";
        const feld = cells[2].textContent?.trim() ?? "";
        const inhalt = cells[3].textContent?.trim() ?? "";

        if (inid) data[`INID_${inid}`] = inhalt;
        if (feld) fieldData[feld] = inhalt;
        if (kriterium) data[kriterium] = inhalt;
      } else if (cells.length >= 2) {
        // Fallback für 2-Spalten-Rows
        const label = cells[0].textContent?.trim() ?? "";
        const value = cells[cells.length - 1].textContent?.trim() ?? "";
        if (label && value) data[label] = value;
      }
    }

    return { data, fieldData };
  });

  const { data, fieldData } = extracted;

  // Felder zuweisen via INID-Codes, Feld-Kürzel oder Kriterium-Labels
  result.aktenzeichen =
    data["INID_210"] ?? fieldData["AKZ"] ?? data["Aktenzeichen"] ?? "";

  result.anmeldetag =
    data["INID_220"] ?? fieldData["AT"] ?? data["Anmeldetag"] ?? "";

  result.status =
    fieldData["AST"] ?? data["Aktenzustand"] ?? "";

  result.marke =
    data["INID_540"] ?? fieldData["MD"] ?? data["Markendarstellung"] ?? "";

  result.markenform =
    data["INID_550"] ?? fieldData["MF"] ?? data["Markenform"] ?? "";

  result.markenkategorie =
    data["INID_551"] ?? fieldData["MK"] ?? data["Markenkategorie"] ?? "";

  // Inhaber (730) oder Anmelder
  const inhaberRaw =
    data["INID_730"] ?? fieldData["INH"] ?? fieldData["ANM"] ??
    data["Inhaber"] ?? data["Anmelder"] ?? "";
  const inhaberParts = inhaberRaw.split(",").map((s) => s.trim());
  result.inhaber = inhaberParts[0] ?? "";
  result.inhaberAdresse = inhaberParts.slice(1).join(", ");

  // Nizza-Klassen (511)
  const klassenRaw =
    data["INID_511"] ?? fieldData["KL"] ?? data["Klasse(n)"] ?? "";
  const klassenNumbers = parseKlassen(klassenRaw);
  result.klassen = enrichNizzaClasses(klassenNumbers);

  // Waren/Dienstleistungen (510)
  result.warenDienstleistungen =
    data["INID_510"] ?? fieldData["WDV"] ??
    data["Waren/Dienstleistungen"] ?? "";

  return result;
}

function parseKlassen(text: string): number[] {
  return text
    .split(/[,;\s]+/)
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 45);
}
