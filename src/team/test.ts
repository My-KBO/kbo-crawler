import { chromium } from "playwright";

type Pitcher = {
  team: string;
  name: string;
  ip: number;
  era: number;
};

function parseInning(ipText: string): number {
  if (!ipText) return 0;
  const parts = ipText.trim().split(" ");
  const fullInning = parseInt(parts[0]) || 0;
  let fraction = 0;

  if (parts.length > 1 && parts[1].includes("/")) {
    const [numerator, denominator] = parts[1].split("/").map(Number);
    if (denominator !== 0) {
      fraction = numerator / denominator;
    }
  }

  return fullInning + fraction;
}

async function getTopPitchersByERA() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("✅ 팀별 평균자책점 1위 투수(이닝 ≥ 30) 크롤링 중...");
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
        team: cells[2]?.textContent?.trim(),
        name: cells[1]?.textContent?.trim(),
        era: parseFloat(cells[3]?.textContent ?? "99.99"),
        ipText: cells[10]?.textContent?.trim() ?? "",
      };
    });
  });

  const pitchers: Pitcher[] = allPitchers.map((p) => ({
    team: p.team ?? "",
    name: p.name ?? "",
    era: parseFloat(p.era.toFixed(3)), // ERA 소수점 3자리
    ip: parseFloat(parseInning(p.ipText).toFixed(1)), // IP 소수점 1자리
  }));

  const qualified = pitchers.filter((p) => p.ip >= 30 && !isNaN(p.era));

  const topByTeam = new Map<string, Pitcher>();
  for (const p of qualified) {
    if (!p.team) continue;
    const current = topByTeam.get(p.team);
    if (!current || current.era > p.era) {
      topByTeam.set(p.team, p);
    }
  }

  console.log("🎯 팀별 ERA 1위 투수 (이닝 ≥ 30)");
  console.table(Array.from(topByTeam.values()));

  await browser.close();
}

getTopPitchersByERA();
