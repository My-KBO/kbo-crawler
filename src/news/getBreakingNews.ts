import { chromium } from "playwright";
import { uploadToS3 } from "../lib/s3Uploader";
import { S3Client } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";

interface NewsItem {
  title: string;
  summary: string;
  date: string;
  url: string;
  thumbnail: string;
}

export async function getBreakingNews(): Promise<NewsItem[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://www.koreabaseball.com/MediaNews/News/BreakingNews/List.aspx",
    {
      waitUntil: "domcontentloaded",
    }
  );

  await page.waitForSelector("ul.boardPhoto > li", { timeout: 5000 });

  const news = await page.$$eval("ul.boardPhoto > li", (elements) => {
    return elements.map((el) => {
      const aTag = el.querySelector("a");
      const pTag = el.querySelector("p");
      const imgTag = el.querySelector("img");

      const rawSummary = pTag?.textContent?.trim() || "";
      const [firstLine, ...rest] = rawSummary.split("\n");

      const title = firstLine.trim();
      const summary = rest.join("\n").trim();

      const date = el.querySelector(".date")?.textContent?.trim() || "";
      const href = aTag?.getAttribute("href") || "";
      const url =
        "https://www.koreabaseball.com/MediaNews/News/BreakingNews/" + href;

      const thumbnailSrc = imgTag?.getAttribute("src") || "";
      const thumbnail = thumbnailSrc.startsWith("http")
        ? thumbnailSrc
        : "https://www.koreabaseball.com" + thumbnailSrc;

      return { title, summary, date, url, thumbnail };
    });
  });

  // S3에 이미지 업로드 처리
  const newsWithS3 = [];
  for (const item of news) {
    const s3Url = await uploadToS3(item.thumbnail);
    newsWithS3.push({
      ...item,
      thumbnail: s3Url ?? item.thumbnail, // 실패 시 원본 유지
    });
  }

  await browser.close();
  return newsWithS3;
}
