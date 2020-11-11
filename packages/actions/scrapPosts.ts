import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import currentPosts from "../xgp.community/api/v1/posts.json";
import { Post } from "../types";

const OUTPUT_DIR = path.join(__dirname, "..", "xgp.community", "api", "v1");
const XBOX_GAME_PASS_BLOG_URL = "https://news.xbox.com/en-US/xbox-game-pass/";
const SELECTORS = {
  posts: ".media.feed",
  lastPost: ".media.feed:last-of-type",
  post: {
    url: ".feed__title a",
    title: ".feed__title",
    publishedAt: ".feed__date time",
  },
  next: ".next.page-numbers",
};
const SINCE = new Date(currentPosts[0].publishedAt);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const posts: Post[] = [];

  await page.goto(XBOX_GAME_PASS_BLOG_URL);

  await (async function extractCurrentPage(): Promise<void> {
    await page.waitForSelector(SELECTORS.posts);

    posts.push(
      ...(await page.$$eval(
        SELECTORS.posts,
        (elements, selectors, since) =>
          elements
            .map((element) => ({
              url: element
                .querySelector(selectors.post.url)!
                .getAttribute("href")!,
              title: element
                .querySelector(selectors.post.title)!
                .textContent!.trim(),
              publishedAt: element
                .querySelector(selectors.post.publishedAt)!
                .getAttribute("datetime")!,
            }))
            .filter(
              (post) =>
                new Date(post.publishedAt).getTime() > new Date(since).getTime()
            ),
        SELECTORS,
        SINCE
      ))
    );

    const lastPostPublishedAt = await page.$eval(
      SELECTORS.lastPost,
      (element, selectors) =>
        element
          .querySelector(selectors.post.publishedAt)!
          .getAttribute("datetime")!,
      SELECTORS
    );

    if (new Date(lastPostPublishedAt).getTime() > SINCE.getTime()) {
      await page.click(SELECTORS.next);
      return extractCurrentPage();
    }

    await fse.writeJSON(
      path.join(OUTPUT_DIR, "posts.json"),
      posts.concat(currentPosts),
      {
        spaces: 2,
      }
    );
  })();

  browser.close();
})();
