import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import currentNews from "../xgp.community/api/v1/news.json";
import { APINews } from "../types";

const OUTPUT_DIR = path.join(__dirname, "..", "xgp.community", "api", "v1");
const XBOX_GAME_PASS_BLOG_URL = "https://news.xbox.com/en-US/xbox-game-pass/";
const SELECTORS = {
  news: ".media.feed",
  lastNewsItem: ".media.feed:last-of-type",
  newsItem: {
    url: ".feed__title a",
    title: ".feed__title",
    publishedAt: ".feed__date time",
  },
  next: ".next.page-numbers",
};
const SINCE = new Date(currentNews[0].publishedAt);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const news: APINews[] = [];

  await page.goto(XBOX_GAME_PASS_BLOG_URL);

  await (async function extractCurrentPage(): Promise<void> {
    await page.waitForSelector(SELECTORS.news);

    news.push(
      ...(await page.$$eval(
        SELECTORS.news,
        (elements, selectors, since) =>
          elements
            .map((element) => ({
              url: element
                .querySelector(selectors.newsItem.url)!
                .getAttribute("href")!,
              title: element
                .querySelector(selectors.newsItem.title)!
                .textContent!.trim(),
              publishedAt: element
                .querySelector(selectors.newsItem.publishedAt)!
                .getAttribute("datetime")!,
            }))
            .filter(
              (newsItem) =>
                new Date(newsItem.publishedAt).getTime() >
                new Date(since).getTime()
            ),
        SELECTORS,
        SINCE
      ))
    );

    const lastNewsItemPublishedAt = await page.$eval(
      SELECTORS.lastNewsItem,
      (element, selectors) =>
        element
          .querySelector(selectors.newsItem.publishedAt)!
          .getAttribute("datetime")!,
      SELECTORS
    );

    if (new Date(lastNewsItemPublishedAt).getTime() > SINCE.getTime()) {
      await page.click(SELECTORS.next);
      return extractCurrentPage();
    }

    await fse.writeJSON(
      path.join(OUTPUT_DIR, "news.json"),
      news.concat(currentNews),
      {
        spaces: 2,
      }
    );
  })();

  browser.close();
})();
