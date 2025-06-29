import { chromium } from "playwright";

export async function fetchTeamRanking() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("https://www.koreabaseball.com/TeamRank/TeamRank.aspx", {
    waitUntil: "domcontentloaded",
  });

  // 테이블이 완전히 렌더링되었는지 대기 요
  await page.waitForSelector(
    "#cphContents_cphContents_cphContents_udpRecord table"
  );

  const rankings = await page.$$eval(
    "#cphContents_cphContents_cphContents_udpRecord table tbody tr",
    (rows) => {
      return rows.map((row) => {
        const cols = Array.from(row.querySelectorAll("td")).map(
          (el) => el.textContent?.trim() || ""
        );
        return {
          rank: parseInt(cols[0]),
          team: cols[1],
          games: parseInt(cols[2]),
          win: parseInt(cols[3]),
          lose: parseInt(cols[4]),
          draw: parseInt(cols[5]),
          winRate: parseFloat(cols[6]),
          gameGap: cols[7],
          streak: cols[8],
        };
      });
    }
  );

  await browser.close();
  return rankings;
}
