import { chromium } from "playwright";

type PlayerRanking = {
  category: string;
  name: string;
  team: string;
  value: string;
};

const categories = ["타율", "홈런", "평균자책점", "승리"];

export async function fetchTopPlayers(): Promise<PlayerRanking[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: PlayerRanking[] = [];

  try {
    await page.goto("https://www.koreabaseball.com/Record/Ranking/Top5.aspx", {
      timeout: 60000,
    });

    for (const category of categories) {
      const recordBox = page.locator(
        `.record:has(.title_bar:has-text("${category} TOP5"))`
      );

      const name = await recordBox
        .locator(".rankList li >> nth=0 >> .name a")
        .innerText();
      const team = await recordBox
        .locator(".rankList li >> nth=0 >> .team")
        .innerText();
      const value = await recordBox
        .locator(".rankList li >> nth=0 >> .rr")
        .innerText();

      results.push({ category, name, team, value });
    }

    return results;
  } catch (err) {
    console.error("[크롤링 실패]", err);
    return [];
  } finally {
    await browser.close();
  }
}
