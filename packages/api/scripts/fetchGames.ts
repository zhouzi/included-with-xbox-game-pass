import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import { APIGame } from "@included-with-xbox-game-pass/types";
import currentGames from "../static/games.json";

const screenshotsDir = path.join(__dirname, "screenshots");
const outputPath = path.join(__dirname, "..", "static", "games.json");
const xboxGamePassURL = "https://www.xbox.com/en-US/xbox-game-pass/games";
const selectors = {
  games: `.gameList [itemtype="http://schema.org/Product"]`,
  game: {
    name: "h3",
    url: "a",
  },
  currentPage: ".paginatenum.f-active",
  next: ".paginatenext:not(.pag-disabled) a",
  totalGames: ".resultsText",
  pages: ".paginatenum",
};

(async () => {
  await fse.emptyDir(screenshotsDir);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const games: APIGame[] = [];
  const expectations: { games: null | number; pages: null | number } = {
    games: null,
    pages: null,
  };

  await page.goto(xboxGamePassURL);

  await (async function extractCurrentPage(): Promise<void> {
    await page.waitForSelector(selectors.games);

    if (expectations.games == null || expectations.pages == null) {
      expectations.games = await page.$eval(selectors.totalGames, (element) =>
        Number(element.textContent!.match(/([0-9]+) result/)![1])
      );
      expectations.pages = await page.$$eval(selectors.pages, (elements) =>
        Number(elements[elements.length - 1].getAttribute("data-topage"))
      );
    }

    const currentPage = await page.$eval(selectors.currentPage, (element) =>
      element.getAttribute("data-topage")
    );
    await page.screenshot({
      path: path.join(screenshotsDir, `page-${currentPage}.png`),
      fullPage: true,
    });

    games.push(
      ...(await page.$$eval(
        selectors.games,
        (elements, selectors) =>
          elements.map((element) => ({
            name: element.querySelector(selectors.game.name)!.textContent!,
            url: (element.querySelector(
              selectors.game.url
            ) as HTMLAnchorElement).href,
          })),
        selectors
      ))
    );

    try {
      await page.click(selectors.next);
      return extractCurrentPage();
    } catch (err) {
      console.log(
        `The current games.json file contains ${currentGames.length} games and the new one ${games.length}.`
      );
      console.log(
        `It was expected to go through ${expectations.pages} and ended on page ${currentPage}.`
      );
      console.log(
        `It was expected to find ${expectations.games} and found ${games.length} in the end.`
      );
      console.log(`See screenshots in ${screenshotsDir} for more details.`);

      await fse.writeJSON(
        outputPath,
        games.sort((a, b) => {
          if (a.name > b.name) {
            return 1;
          }

          if (b.name > a.name) {
            return -1;
          }

          return 0;
        }),
        {
          spaces: 2,
        }
      );
    }
  })();

  browser.close();
})();
