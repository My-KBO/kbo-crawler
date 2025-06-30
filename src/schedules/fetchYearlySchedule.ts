import { chromium } from "playwright";

function parseGame(game: string) {
  const parts = game.split("vs");
  if (parts.length !== 2) return null;

  const left = parts[0].trim();
  const right = parts[1].trim();

  const leftMatch = left.match(/^([가-힣A-Z]+)(\d+)$/);
  const rightMatch = right.match(/^(\d+)([가-힣A-Z]+)$/);

  if (leftMatch && rightMatch) {
    return {
      homeTeam: leftMatch[1],
      homeScore: leftMatch[2],
      awayScore: rightMatch[1],
      awayTeam: rightMatch[2],
    };
  }

  const teamOnlyLeft = left.match(/^([가-힣A-Z]+)$/);
  const teamOnlyRight = right.match(/^([가-힣A-Z]+)$/);

  if (teamOnlyLeft && teamOnlyRight) {
    return {
      homeTeam: teamOnlyLeft[1],
      homeScore: "",
      awayScore: "",
      awayTeam: teamOnlyRight[1],
    };
  }

  return null;
}

export async function fetchMonthlySchedule(year: number, month: number) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const url = `https://www.koreabaseball.com/Schedule/Schedule.aspx`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  await page.selectOption("#ddlYear", String(year));
  await page.waitForTimeout(1000);
  await page.selectOption("#ddlMonth", String(month).padStart(2, "0"));
  await page.waitForTimeout(2000);

  const rawData = await page.$$eval("table.tbl > tbody > tr", (rows) => {
    const results = [];

    let currentDate = "";

    for (const row of rows) {
      const tds = Array.from(row.querySelectorAll("td"));
      const hasDate = tds.length === 9;

      let date = "",
        time = "",
        game = "",
        tv = "",
        stadium = "",
        note = "";

      if (hasDate) {
        date = tds[0]?.textContent?.trim() || "";
        currentDate = date;
        time = tds[1]?.textContent?.trim() || "";
        game = tds[2]?.textContent?.trim() || "";
        tv = tds[5]?.textContent?.trim() || "";
        stadium = tds[7]?.textContent?.trim() || "";
        note = tds[8]?.textContent?.trim() || "";
      } else {
        date = currentDate;
        time = tds[0]?.textContent?.trim() || "";
        game = tds[1]?.textContent?.trim() || "";
        tv = tds[4]?.textContent?.trim() || "";
        stadium = tds[6]?.textContent?.trim() || "";
        note = tds[7]?.textContent?.trim() || "";
      }

      results.push({ date, time, game, tv, stadium, note });
    }

    return results;
  });

  await browser.close();

  const finalData = rawData.map(({ date, time, game, tv, stadium, note }) => {
    const parsed = parseGame(game);
    if (!parsed) {
      console.log("parseGame 실패:", game);
    }

    return {
      date,
      time,
      homeTeam: parsed?.homeTeam || "",
      homeScore: parsed?.homeScore || "",
      awayTeam: parsed?.awayTeam || "",
      awayScore: parsed?.awayScore || "",
      tv,
      stadium,
      note,
    };
  });

  return finalData;
}
