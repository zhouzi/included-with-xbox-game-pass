import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import alphaSort from "alpha-sort";
import { APIGame } from "../types";
import currentGames from "../xgp.community/api/v1/games.json";

const screenshotsDir = path.join(__dirname, "screenshots");
const outputDir = path.join(__dirname, "..", "xgp.community", "api", "v1");
const xboxGamePassURL = "https://www.xbox.com/en-US/xbox-game-pass/games";
const selectors = {
  games: `.gameList [itemtype="http://schema.org/Product"]`,
  game: {
    name: "h3",
    url: "a",
    image: "img",
    availability: {
      console: `[aria-label="Console"]`,
      pc: `[aria-label="PC"]`,
    },
  },
  currentPage: ".paginatenum.f-active",
  next: ".paginatenext:not(.pag-disabled) a",
  totalGames: ".resultsText",
  pages: ".paginatenum",
};
const addedAt = new Date().toISOString();

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
      Number(element.getAttribute("data-topage")!)
    );
    await page.screenshot({
      path: path.join(screenshotsDir, `page-${currentPage}.png`),
      fullPage: true,
    });

    games.push(
      ...(await page.$$eval(
        selectors.games,
        (elements, selectors, addedAt) =>
          elements.map(
            (element): APIGame => ({
              id: element.getAttribute("data-bigid")!,
              name: element.querySelector(selectors.game.name)!.textContent!,
              url: (element.querySelector(
                selectors.game.url
              ) as HTMLAnchorElement).href,
              image: element
                .querySelector(selectors.game.image)!
                .getAttribute("src")!,
              availability: {
                console: Boolean(
                  element.querySelector(selectors.game.availability.console)
                ),
                pc: Boolean(
                  element.querySelector(selectors.game.availability.pc)
                ),
              },
              releaseDate: element.getAttribute("data-releasedate")!,
              addedAt: addedAt,
            })
          ),
        selectors,
        addedAt
      ))
    );

    try {
      await page.click(selectors.next);
      return extractCurrentPage();
    } catch (err) {
      if (
        currentPage !== expectations.pages ||
        games.length !== expectations.games
      ) {
        throw new Error(
          `The script stopped at page ${currentPage}/${expectations.pages}, with a total of ${games.length}/${expectations.games}. See the screenshots in ${screenshotsDir} for more details.`
        );
      }

      games.sort((a, b) => {
        const nameSort = alphaSort.caseInsensitiveAscending(a.name, b.name);
        return nameSort === 0
          ? alphaSort.caseInsensitiveAscending(a.id, b.id)
          : nameSort;
      });
      games.forEach((game) => {
        const currentGame = currentGames.find(
          (otherGame) => otherGame.id === game.id
        );

        if (currentGame == null) {
          return;
        }

        // do not update the addedAt date if the game was already included
        game.addedAt = currentGame.addedAt;
      });

      console.log(
        `The script ended with a total of ${games.length} (previously: ${currentGames.length}).`
      );

      await fse.writeJSON(path.join(outputDir, "games.json"), games, {
        spaces: 2,
      });
      await fse.copyFile(
        path.join(outputDir, "games.json"),
        path.join(__dirname, "..", "gh-pages", "games.json")
      );
    }
  })();

  browser.close();
})();
