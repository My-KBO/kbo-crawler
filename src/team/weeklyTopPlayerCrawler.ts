import { chromium } from "playwright";

type StatRow = {
  team: string;
  name: string;
  type: "타자" | "투수";
  game: number;
  value: number;
};

function parseInning(ipText: string): number {
  if (!ipText) return 0;
  const parts = ipText.trim().split(" ");
  const fullInning = parseInt(parts[0]) || 0;
  let fraction = 0;
  if (parts.length > 1 && parts[1].includes("/")) {
    const [numerator, denominator] = parts[1].split("/").map(Number);
    if (denominator !== 0) fraction = numerator / denominator;
  }
  return fullInning + fraction;
}

export async function getUnifiedTopStats(): Promise<StatRow[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const result: StatRow[] = [];

  await page.goto(
    "https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx",
    {
      waitUntil: "domcontentloaded",
    }
  );

  await page.waitForTimeout(5000);
  await page.waitForSelector("table tbody tr");

  const allHitters = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    return rows.map((row) => {
      const cells = row.querySelectorAll("td");
      return {
        team: cells[2]?.textContent?.trim() ?? "",
        name: cells[1]?.textContent?.trim() ?? "",
        plateAppearance: parseInt(
          cells[5]?.textContent?.replace(/,/g, "") ?? "0"
        ),
        avg: parseFloat(cells[3]?.textContent ?? "0"),
      };
    });
  });

  const topHittersByTeam = new Map<string, StatRow>();
  for (const p of allHitters) {
    if (p.plateAppearance < 100 || isNaN(p.avg)) continue;
    const current = topHittersByTeam.get(p.team);
    if (!current || current.value < p.avg) {
      topHittersByTeam.set(p.team, {
        team: p.team,
        name: p.name,
        type: "타자",
        game: p.plateAppearance,
        value: parseFloat(p.avg.toFixed(3)),
      });
    }
  }

  result.push(...Array.from(topHittersByTeam.values()));

  await page.goto(
    "https://www.koreabaseball.com/Record/Player/PitcherBasic/Basic1.aspx",
    {
      waitUntil: "domcontentloaded",
    }
  );

  await page.waitForTimeout(5000);
  await page.waitForFunction(() => {
    return document.querySelectorAll("table tbody tr").length >= 10;
  });

  const allPitchers = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    return rows.map((row) => {
      const cells = row.querySelectorAll("td");
      return {
        team: cells[2]?.textContent?.trim() ?? "",
        name: cells[1]?.textContent?.trim() ?? "",
        era: parseFloat(cells[3]?.textContent ?? "99.99"),
        ipText: cells[10]?.textContent?.trim() ?? "",
      };
    });
  });

  const topPitchersByTeam = new Map<string, StatRow>();
  for (const p of allPitchers) {
    const ip = parseInning(p.ipText);
    if (ip < 30 || isNaN(p.era)) continue;
    const current = topPitchersByTeam.get(p.team);
    if (!current || current.value > p.era) {
      topPitchersByTeam.set(p.team, {
        team: p.team,
        name: p.name,
        type: "투수",
        game: parseFloat(ip.toFixed(1)),
        value: parseFloat(p.era.toFixed(3)),
      });
    }
  }

  result.push(...Array.from(topPitchersByTeam.values()));

  await browser.close();
  return result;
}

(async () => {
  const stats = await getUnifiedTopStats();
  console.table(stats);
})();
