import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import alphaSort from "alpha-sort";
import { APIGame, Patch } from "@included-with-xbox-game-pass/types";
import currentGames from "../static/games.json";

const screenshotsDir = path.join(__dirname, "screenshots");
const staticDir = path.join(__dirname, "..", "static");
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
        (elements, selectors) =>
          elements.map((element) => ({
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
          })),
        selectors
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

      console.log(
        `The script ended with a total of ${games.length} (previously: ${currentGames.length}).`
      );

      const patch = createPatch(currentGames, games);
      if (Object.keys(patch).length > 0) {
        await fse.writeJSON(
          path.join(
            staticDir,
            "patch",
            `${new Date().toLocaleDateString("en-US").replace(/\//g, "-")}.json`
          ),
          patch,
          {
            spaces: 2,
          }
        );
      }

      await fse.writeJSON(path.join(staticDir, "games.json"), games, {
        spaces: 2,
      });
    }
  })();

  browser.close();
})();

function createPatch(before: APIGame[], after: APIGame[]): Patch {
  const beforeMap = before.reduce<Record<string, APIGame>>(
    (acc, game) =>
      Object.assign(acc, {
        [game.id]: game,
      }),
    {}
  );
  const afterMap = after.reduce<Record<string, APIGame>>(
    (acc, game) =>
      Object.assign(acc, {
        [game.id]: game,
      }),
    {}
  );
  const gameIDs = before
    .concat(after)
    .map((game) => game.id)
    .filter((gameID, index, gameIDs) => gameIDs.indexOf(gameID) === index);

  return gameIDs.reduce<Patch>((acc, gameID) => {
    const beforeGame = beforeMap[gameID];
    const afterGame = afterMap[gameID];

    if (beforeGame && afterGame == null) {
      acc[gameID] = {
        before: beforeGame,
        after: null,
      };
    } else if (beforeGame == null && afterGame) {
      acc[gameID] = {
        before: null,
        after: afterGame,
      };
    } else if (hasAvailabilityChanges(beforeGame, afterGame)) {
      acc[gameID] = {
        before: beforeGame,
        after: afterGame,
      };
    }

    return acc;
  }, {});
}

function hasAvailabilityChanges(before: APIGame, after: APIGame): boolean {
  const platforms = Object.keys(before.availability) as Array<
    keyof APIGame["availability"]
  >;
  return platforms.some(
    (platform) => before.availability[platform] !== after.availability[platform]
  );
}
