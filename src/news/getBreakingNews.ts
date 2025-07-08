import { chromium } from "playwright";
import { uploadToS3 } from "../lib/s3Uploader"; // 너가 이미 만든 함수

interface NewsItem {
  title: string;
  summary: string;
  date: string;
  url: string;
  thumbnail: string;
}

export async function getBreakingNews(): Promise<NewsItem[]> {
  const browser = await chromium.launch({ headless: true }); // 필요 시 false로 시각화
  const page = await browser.newPage();

  const allNews: NewsItem[] = [];

  await page.goto(
    "https://www.koreabaseball.com/MediaNews/News/BreakingNews/List.aspx",
    {
      waitUntil: "domcontentloaded",
    }
  );

  for (let i = 1; i <= 5; i++) {
    await page.waitForSelector("ul.boardPhoto > li", { timeout: 5000 });

    console.log(`📄 [${i}] 페이지 수집 중...`);

    const newsOnPage: NewsItem[] = await page.$$eval(
      "ul.boardPhoto > li",
      (elements) => {
        return elements.map((el) => {
          const aTag = el.querySelector("a");
          const pTag = el.querySelector("p");
          const imgTag = el.querySelector("img");

          const rawSummary = pTag?.textContent?.trim() || "";
          const lines = rawSummary
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          const title = lines[0] || "";
          const summary = lines[1] || "";
          const date = el.querySelector(".date")?.textContent?.trim() || "";

          const href = aTag?.getAttribute("href") || "";
          const fullUrl =
            "https://www.koreabaseball.com/MediaNews/News/BreakingNews/" + href;

          const thumbnailSrc = imgTag?.getAttribute("src") || "";
          const thumbnail = thumbnailSrc.startsWith("http")
            ? thumbnailSrc
            : "https://www.koreabaseball.com" + thumbnailSrc;

          return { title, summary, date, url: fullUrl, thumbnail };
        });
      }
    );

    allNews.push(...newsOnPage);

    // 다음 페이지 클릭 및 대기
    if (i < 5) {
      const nextPageBtnId = `#cphContents_cphContents_cphContents_ucPager_btnNo${
        i + 1
      }`;

      // 현재 뉴스 타이틀 저장
      const beforeTitles = await page.$$eval("ul.boardPhoto > li p", (els) =>
        els.map((el) => el.textContent?.trim())
      );

      await page.click(nextPageBtnId);

      // 제목이 바뀔 때까지 대기
      await page.waitForFunction(
        (prev) => {
          const titles = Array.from(
            document.querySelectorAll("ul.boardPhoto > li p")
          ).map((el) => el.textContent?.trim());
          return JSON.stringify(titles) !== JSON.stringify(prev);
        },
        beforeTitles,
        { timeout: 10000 }
      );
    }
  }

  console.log(`🖼 썸네일 S3 업로드 시작...`);

  const newsWithS3: NewsItem[] = [];
  for (const item of allNews) {
    try {
      const s3Url = await uploadToS3(item.thumbnail);
      newsWithS3.push({
        ...item,
        thumbnail: s3Url ?? item.thumbnail,
      });
    } catch (err) {
      console.warn(`⚠️ S3 업로드 실패: ${item.thumbnail}`, err);
      newsWithS3.push(item); // 실패해도 원본 URL 유지
    }
  }

  await browser.close();
  return newsWithS3;
}
