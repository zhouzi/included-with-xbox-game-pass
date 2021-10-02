import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import alphaSort from "alpha-sort";
import random from "random-int";
import slugify from "@sindresorhus/slugify";
import got from "got";
import { Game } from "@included-with-xbox-game-pass/types";

import currentGames from "../website/static/games.json";
import { ALIASES } from "./aliases";

const OUTPUT_DIR = path.join(__dirname, "..", "website", "static");
const NOW = new Date().toISOString();

(async function updateGamesList() {
  const scrappedGames = await scrapGames();

  const games = sortGames(scrappedGames).reduce<Record<string, Game>>(
    (acc, scrappedGame) => {
      const name =
        (Object.keys(ALIASES) as Array<keyof typeof ALIASES>).find((name) =>
          ALIASES[name].includes(scrappedGame.name)
        ) ?? scrappedGame.name;
      const slug = slugify(name, {
        decamelize: false,
      });
      const currentGame = currentGames.find((game) => game.slug === slug);

      if (acc[slug] == null) {
        acc[slug] = {
          slug,
          name,
          availability: {
            console: null,
            pc: null,
            steam: currentGame?.availability.steam ?? null,
          },
          steam: currentGame?.steam ?? null,
          updatedAt: NOW,
        };
      }

      const game = acc[slug];

      if (scrappedGame.availability.console) {
        game.availability.console = scrappedGame.url;
      }

      if (scrappedGame.availability.pc) {
        game.availability.pc = scrappedGame.url;
      }

      return acc;
    },
    {}
  );

  Object.values(games).forEach((game) => {
    const currentGame = currentGames.find(
      (currentGame) => currentGame.slug === game.slug
    );
    if (currentGame && !hasNewAvailability(currentGame, game)) {
      // by default all games' updatedAt is set to NOW
      // so we revert it to its old value if it turns out that the game has no new availability
      game.updatedAt = currentGame.updatedAt;
    }
  });

  await addSteamIdToGames(games);

  await fse.writeJSON(
    path.join(OUTPUT_DIR, "games.json"),
    sortGames(Object.values(games)),
    {
      spaces: 2,
    }
  );
})();

async function addSteamIdToGames(games: Record<string, Game>) {
  const {
    applist: { apps },
  } = await got("https://api.steampowered.com/ISteamApps/GetAppList/v2/").json<{
    applist: { apps: Array<{ appid: number; name: string }> };
  }>();
  apps.forEach((app) => {
    const slug = slugify(app.name, {
      decamelize: false,
    });

    if (!games.hasOwnProperty(slug)) {
      return;
    }

    if (games[slug].steam == null) {
      games[slug].steam = app.appid;

      // this property is deprecated and will be removed in the future
      // until then let's keep it updated
      games[
        slug
      ].availability.steam = `https://store.steampowered.com/app/${app.appid}/`;
    }
  });
}

// Represents a game as scrapped from the Xbox Game Pass website
// It doesn't have all the final data and structure yet
interface ScrappedGame {
  name: string;
  url: string;
  availability: {
    console: boolean;
    pc: boolean;
  };
}

async function scrapGames(): Promise<ScrappedGame[]> {
  const scrappedGames: ScrappedGame[] = [];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://www.xbox.com/en-US/xbox-game-pass/games", {
    waitUntil: "domcontentloaded",
  });

  await page.click(`[data-theplat="xbox"]`);
  await scrapCurrentPageAndGoNext(page, scrappedGames, {
    console: true,
  });

  await page.click(`[data-theplat="pc"]`);
  await scrapCurrentPageAndGoNext(page, scrappedGames, {
    pc: true,
  });

  browser.close();

  return scrappedGames;
}

async function scrapCurrentPageAndGoNext(
  page: puppeteer.Page,
  scrappedGames: ScrappedGame[],
  availability: Partial<ScrappedGame["availability"]>
): Promise<void> {
  await page.waitForSelector(
    `.gameList [itemtype="http://schema.org/Product"]`
  );

  scrappedGames.push(
    ...(await page.$$eval(
      `.gameList [itemtype="http://schema.org/Product"]`,
      (elements, availability) =>
        elements.map(
          (element): ScrappedGame => ({
            name: element.querySelector("h3")!.textContent!,
            url: element.querySelector("a")!.href,
            availability: {
              console: Boolean(element.querySelector(`[aria-label="Console"]`)),
              pc: Boolean(element.querySelector(`[aria-label="PC"]`)),
              ...availability,
            },
          })
        ),
      availability
    ))
  );

  try {
    await page.waitForTimeout(random(500, 2000));
    await page.click(".paginatenext:not(.pag-disabled) a");

    return scrapCurrentPageAndGoNext(page, scrappedGames, availability);
  } catch (err) {}
}

function sortGames<T extends Array<{ name: string }>>(games: T): T {
  const compareNames = alphaSort({
    caseInsensitive: true,
  });
  return games.sort((a, b) => compareNames(a.name, b.name));
}

function hasNewAvailability(oldGame: Game, newGame: Game): boolean {
  return (
    (Boolean(newGame.availability.console) && !oldGame.availability.console) ||
    (Boolean(newGame.availability.pc) && !oldGame.availability.pc)
  );
}
