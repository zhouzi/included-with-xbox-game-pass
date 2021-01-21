import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import alphaSort from "alpha-sort";
import random from "random-int";
import { subDays, startOfDay, isBefore } from "date-fns";
import slugify from "@sindresorhus/slugify";
import got from "got";
import { Game } from "@xgp/types";

import currentGames from "../xgp.community/static/games.json";

// games tend to have funky names on the xbox game pass store
// so below is a mapping of the game's real name -> the names found on the xbox store
const ALIASES = {
  "Totally Accurate Battle Simulator": [
    "Totally Accurate Battle Simulator (Game Preview)",
  ],
  "Cities: Skylines": [
    "Cities: Skylines - Xbox One Edition",
    "Cities: Skylines - Windows 10 Edition",
  ],
  Frostpunk: ["Frostpunk: Console Edition"],
  "Goat Simulator": ["Goat Simulator Windows 10"],
  "Mount & Blade: Warband": ["Mount & Blade: Warband PC"],
  Pikuniku: ["Pikuniku Win10"],
  Stellaris: ["Stellaris: Console Edition"],
  "A Plague Tale: Innocence": ["A Plague Tale: Innocence - Windows 10"],
  "Dead by Daylight": [
    "Dead by Daylight Windows",
    "Dead by Daylight: Special Edition",
  ],
  "DOOM Eternal Standard Edition": ["DOOM Eternal Standard Edition (PC)"],
  "Fallout 76": ["Fallout 76 - PC"],
  "FINAL FANTASY VII": ["FINAL FANTASY VII WINDOWS EDITION"],
  "FINAL FANTASY VIII Remastered": [
    "FINAL FANTASY VIII Remastered WINDOWS EDITION",
  ],
  "Gears of War: Ultimate Edition": [
    "Gears of War: Ultimate Edition for Windows 10",
  ],
  GONNER2: ["GONNER2 WIN10"],
  GreedFall: ["GreedFall - Windows 10"],
  Grounded: ["Grounded - Game Preview"],
  "Halo Wars: Definitive Edition": ["Halo Wars: Definitive Edition (PC)"],
  "Katana Zero": ["Katana Zero XB1"],
  "Minecraft Dungeons": ["Minecraft Dungeons - Windows 10"],
  "Night in the Woods": ["Night in the Woods Win10"],
  "RAGE 2": ["RAGE 2 (PC)"],
  "The Surge 2": ["The Surge 2 - Windows 10"],
  "Unruly Heroes": ["Unruly Heroes Windows 10"],
  "Wasteland 3": ["Wasteland 3 (PC)", "Wasteland 3 (Xbox One)"],
  "Wolfenstein: Youngblood": ["Wolfenstein: Youngblood (PC)"],
  "Yakuza 0": ["Yakuza 0 for Windows 10"],
  "Yakuza Kiwami 2": ["Yakuza Kiwami 2 for Windows 10"],
  "Yakuza Kiwami": ["Yakuza Kiwami for Windows 10"],
  "Wilmot's Warehouse": ["Wilmot's Warehouse Win10"],
  "F1® 2019": ["F1® 2019 PC"],
  "MotoGP™20": ["MotoGP™20 - Windows Edition"],
  "Planet Coaster": ["Planet Coaster: Console Edition"],
  "WORLD OF HORROR": ["WORLD OF HORROR (Game Preview)"],
  "FINAL FANTASY XV": [
    "FINAL FANTASY XV WINDOWS EDITION",
    "FINAL FANTASY XV ROYAL EDITION",
  ],
  "Battlefleet Gothic: Armada 2": ["Battlefleet Gothic: Armada 2 - Windows 10"],
  "Europa Universalis IV": ["Europa Universalis IV - Microsoft Store Edition"],
  Comanche: ["Comanche (Game Preview)"],
  Control: ["Control Standard Edition"],
  Beholder: ["Beholder Complete Edition"],
  "eFootball PES 2021 SEASON UPDATE": [
    "eFootball PES 2021 SEASON UPDATE STANDARD EDITION",
  ],
  "Hollow Knight": ["Hollow Knight: Voidheart Edition"],
  "NieR:Automata™": ["NieR:Automata™ BECOME AS GODS Edition"],
  "PAYDAY 2": ["PAYDAY 2: CRIMEWAVE EDITION"],
  "Pillars of Eternity": [
    "Pillars of Eternity: Complete Edition",
    "Pillars of Eternity: Hero Edition",
  ],
  "Tom Clancy's Rainbow Six® Siege": [
    "Tom Clancy's Rainbow Six® Siege Deluxe Edition",
  ],
};

const OUTPUT_DIR = path.join(__dirname, "..", "xgp.community", "static");
const NOW = new Date().toISOString();

(async function updateGamesList() {
  const scrappedGames = await getScrappedGames();

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

      if (currentGame && !hasNewAvailability(currentGame, game)) {
        game.updatedAt = currentGame.updatedAt;
      }

      return acc;
    },
    {}
  );

  await updateSteamRelation(games);
  await updateSteamReviews(games);

  await fse.writeJSON(
    path.join(OUTPUT_DIR, "games.json"),
    sortGames(Object.values(games)),
    {
      spaces: 2,
    }
  );
})();

async function updateSteamRelation(games: Record<string, Game>) {
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
      games[slug].steam = {
        appid: app.appid,
        reviews: games[slug].steam?.reviews ?? null,
      };

      // this property is deprecated and will be removed in the future
      // until then let's keep it updated
      games[
        slug
      ].availability.steam = `https://store.steampowered.com/app/${app.appid}/`;
    }
  });
}

async function updateSteamReviews(games: Record<string, Game>) {
  const oneWeekAgo = startOfDay(subDays(new Date(), 7));
  const priorizedSlugs = Object.values(games)
    .filter((game) => game.steam != null)
    .filter(
      (game) =>
        game.steam!.reviews == null ||
        // filter out reviews updated recently
        // to avoid generating changes with each run
        isBefore(new Date(game.steam!.reviews.updatedAt), oneWeekAgo)
    )
    .sort((a, b) => {
      // prioritize games without reviews data
      if (a.steam!.reviews == null && b.steam!.reviews != null) {
        return -1;
      }
      if (a.steam!.reviews != null && b.steam!.reviews == null) {
        return 1;
      }
      if (a.steam!.reviews == null && b.steam!.reviews == null) {
        return 0;
      }

      // then the oldest ones
      return (
        new Date(a.steam!.reviews!.updatedAt).getTime() -
        new Date(b.steam!.reviews!.updatedAt).getTime()
      );
    })
    // up to 100 requests are made to steam's api to avoid quota limit
    .slice(0, 100)
    .map((game) => game.slug);

  for (const slug of priorizedSlugs) {
    const { appid } = games[slug].steam!;
    const {
      query_summary: {
        review_score,
        review_score_desc,
        total_positive,
        total_negative,
      },
    } = await got(
      `https://store.steampowered.com/appreviews/${appid}?json=1`
    ).json<{
      query_summary: {
        review_score: number;
        review_score_desc: string;
        total_positive: number;
        total_negative: number;
      };
    }>();
    games[slug].steam!.reviews = {
      reviewScore: review_score,
      reviewScoreDesc: review_score_desc,
      totalPositive: total_positive,
      totalNegative: total_negative,
      updatedAt: NOW,
    };
  }
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

async function getScrappedGames(): Promise<ScrappedGame[]> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const scrappedGames: ScrappedGame[] = [];

  await page.goto("https://www.xbox.com/en-US/xbox-game-pass/games");

  await (async function scrapCurrentPageAndGoNext(): Promise<void> {
    await page.waitForSelector(
      `.gameList [itemtype="http://schema.org/Product"]`
    );

    scrappedGames.push(
      ...(await page.$$eval(
        `.gameList [itemtype="http://schema.org/Product"]`,
        (elements) =>
          elements.map(
            (element): ScrappedGame => ({
              name: element.querySelector("h3")!.textContent!,
              url: element.querySelector("a")!.href,
              availability: {
                console: Boolean(
                  element.querySelector(`[aria-label="Console"]`)
                ),
                pc: Boolean(element.querySelector(`[aria-label="PC"]`)),
              },
            })
          )
      ))
    );

    try {
      await page.waitForTimeout(random(500, 2000));
      await page.click(".paginatenext:not(.pag-disabled) a");
      return scrapCurrentPageAndGoNext();
    } catch (err) {}
  })();

  browser.close();

  return scrappedGames;
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
