import { chromium } from "playwright";

type Player = {
  team: string;
  name: string;
  plateAppearance: number;
  avg: number;
};

async function getTopQualifiedHittersByTeam() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("전체 타자 데이터 크롤링 중...");
  await page.goto(
    "https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx",
    {
      waitUntil: "domcontentloaded",
    }
  );

  await page.waitForTimeout(5000);
  await page.waitForSelector("table tbody tr");

  const allPlayers: Player[] = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    return rows.map((row) => {
      const cells = row.querySelectorAll("td");
      return {
        team: cells[2]?.textContent?.trim() ?? "",
        name: cells[1]?.textContent?.trim() ?? "",
        plateAppearance: parseInt(
          cells[5]?.textContent?.replace(/,/g, "") ?? "0"
        ), // PA
        avg: parseFloat(cells[3]?.textContent ?? "0"),
      };
    });
  });

  const qualified = allPlayers.filter(
    (p) => p.plateAppearance >= 100 && !isNaN(p.avg)
  );

  const topByTeam = new Map<string, Player>();
  for (const player of qualified) {
    if (!player.team) continue;
    const current = topByTeam.get(player.team);
    if (!current || current.avg < player.avg) {
      topByTeam.set(player.team, {
        ...player,
        avg: parseFloat(player.avg.toFixed(3)),
      });
    }
  }

  console.table(Array.from(topByTeam.values()));

  await browser.close();
}

getTopQualifiedHittersByTeam();
