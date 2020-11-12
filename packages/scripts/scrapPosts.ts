import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import { Post } from "@xgp/types";

import currentPosts from "../xgp.community/api/posts.json";

const OUTPUT_DIR = path.join(__dirname, "..", "xgp.community", "api");
const XBOX_GAME_PASS_BLOG_URL = "https://news.xbox.com/en-US/xbox-game-pass/";

(async function scrapPosts() {
  const since = new Date(currentPosts[0].publishedAt);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const posts: Post[] = [];

  await page.goto(XBOX_GAME_PASS_BLOG_URL);

  await (async function scrapCurrentPageAndGoNext(): Promise<void> {
    await page.waitForSelector(".media.feed");

    posts.push(
      ...(await page.$$eval(".media.feed", (elements) =>
        elements.map((element) => ({
          url: element.querySelector(".feed__title a")!.getAttribute("href")!,
          title: element.querySelector(".feed__title")!.textContent!.trim(),
          publishedAt: element.querySelector("time")!.getAttribute("datetime")!,
          image: element
            .querySelector(".media-image img")!
            .getAttribute("src")!,
        }))
      ))
    );

    const lastPost = posts[posts.length - 1];
    if (new Date(lastPost.publishedAt).getTime() > since.getTime()) {
      await page.click(".next.page-numbers");
      return scrapCurrentPageAndGoNext();
    }
  })();

  browser.close();

  const newPosts = posts.filter(
    (post) => new Date(post.publishedAt).getTime() > since.getTime()
  );

  await fse.writeJSON(
    path.join(OUTPUT_DIR, "posts.json"),
    newPosts.concat(currentPosts),
    {
      spaces: 2,
    }
  );
})();
