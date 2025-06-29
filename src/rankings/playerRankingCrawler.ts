import { chromium } from "playwright";

export async function fetchTopPlayers() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.koreabaseball.com/Record/Ranking/Top5.aspx", {
    waitUntil: "networkidle",
  });

  await page.waitForSelector(".top5", { timeout: 60000 });

  const result = await page.evaluate(() => {
    const extractPlayer = (sectionSelector: string) => {
      const box = document.querySelector(sectionSelector);
      if (!box) return null;

      const name = box.querySelector(".player")?.textContent?.trim() ?? "";
      const team = box.querySelector(".team")?.textContent?.trim() ?? "";
      const stat = box.querySelector(".record")?.textContent?.trim() ?? "";

      return { name, team, stat };
    };

    return {
      타율1위: extractPlayer(".hitter_ranking .top5:nth-of-type(1)"),
      홈런1위: extractPlayer(".hitter_ranking .top5:nth-of-type(2)"),
      평균자책점1위: extractPlayer(".pitcher_ranking .top5:nth-of-type(1)"),
      승리1위: extractPlayer(".pitcher_ranking .top5:nth-of-type(2)"),
    };
  });

  await browser.close();
  return result;
}
