import { chromium } from "playwright";

export async function fetchMonthlySchedule(year: number, month: number) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const url = `https://www.koreabaseball.com/Schedule/Schedule.aspx`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  await page.selectOption("#ddlYear", String(year));
  await page.waitForTimeout(1000);
  await page.selectOption("#ddlMonth", String(month).padStart(2, "0"));
  await page.waitForTimeout(2000);

  const schedules = await page.$$eval("table.tbl > tbody > tr", (rows) => {
    const result: {
      date: string;
      time: string;
      game: string;
      tv: string;
      stadium: string;
      note: string;
    }[] = [];

    let currentDate = "";

    for (const row of rows) {
      const tds = Array.from(row.querySelectorAll("td"));

      let date = "",
        time = "",
        game = "",
        tv = "",
        stadium = "",
        note = "";

      if (tds.length === 9) {
        // 날짜 포함된 행
        date = tds[0]?.textContent?.trim() || "";
        currentDate = date;
        time = tds[1]?.textContent?.trim() || "";
        game = tds[2]?.textContent?.trim() || "";
        tv = tds[5]?.textContent?.trim() || "";
        stadium = tds[7]?.textContent?.trim() || "";
        note = tds[8]?.textContent?.trim() || "";
      } else if (tds.length === 8) {
        // 날짜 없이 이어지는 경기
        date = currentDate;
        time = tds[0]?.textContent?.trim() || "";
        game = tds[1]?.textContent?.trim() || "";
        tv = tds[4]?.textContent?.trim() || "";
        stadium = tds[6]?.textContent?.trim() || "";
        note = tds[7]?.textContent?.trim() || "";
      }

      result.push({ date, time, game, tv, stadium, note });
    }

    return result;
  });

  await browser.close();
  return schedules;
}
