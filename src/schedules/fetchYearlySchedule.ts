import { chromium } from "playwright";

export async function fetchMonthlySchedule(year: number, month: number) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const url = `https://www.koreabaseball.com/Schedule/Schedule.aspx`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // 1. 년도 선택
  await page.selectOption("#ddlYear", String(year));
  await page.waitForTimeout(1000);

  // 2. 월 선택 (월은 0 패딩 필요)
  const paddedMonth = month.toString().padStart(2, "0");
  await page.selectOption("#ddlMonth", paddedMonth);
  await page.waitForTimeout(2000); // 렌더링 여유 시간

  // 3. 경기 목록 추출
  const schedules = await page.$$eval("table.tbl > tbody > tr", (rows) => {
    const result = [];

    for (const row of rows) {
      const tds = Array.from(row.querySelectorAll("td")).map(
        (el) => el.textContent?.trim() || ""
      );

      result.push({
        date: tds[0],
        time: tds[1],
        game: tds[2],
        tv: tds[5],
        stadium: tds[7],
        note: tds[8],
      });
    }

    return result;
  });

  await browser.close();
  return schedules;
}
