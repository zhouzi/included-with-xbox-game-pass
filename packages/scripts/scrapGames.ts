import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import alphaSort from "alpha-sort";
import random from "random-int";
import slugify from "@sindresorhus/slugify";
import got from "got";
import { Game } from "@included-with-xbox-game-pass/types";

import currentGames from "../website/static/games.json";

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
  "NieR:Automata™": [
    "NieR:Automata™ BECOME AS GODS Edition",
    "NieR:Automata BECOME AS GODS Edition",
  ],
  "PAYDAY 2": ["PAYDAY 2: CRIMEWAVE EDITION"],
  "Pillars of Eternity": [
    "Pillars of Eternity: Complete Edition",
    "Pillars of Eternity: Hero Edition",
  ],
  "Tom Clancy's Rainbow Six® Siege": [
    "Tom Clancy's Rainbow Six® Siege Deluxe Edition",
  ],
  "Prison Architect": ["Prison Architect PC"],
  "The Yakuza Remastered Collection": [
    "The Yakuza Remastered Collection for Windows 10",
  ],
  "Yakuza 3 Remastered": ["Yakuza 3 Remastered for Windows 10"],
  "Yakuza 4 Remastered": ["Yakuza 4 Remastered for Windows 10"],
  "Yakuza 5 Remastered": ["Yakuza 5 Remastered for Windows 10"],
  "Cricket 19": ["Cricket 19 Windows 10"],
  "Elite Dangerous": ["Elite Dangerous Standard Edition"],
  "Madden NFL 21": [
    // they are not exactly the same games and have separate URLs
    // but it's ok to merge them for our use case
    "Madden NFL 21 Xbox One",
    "Madden NFL 21 Xbox Series X|S",
    "Madden NFL 21 Xbox One & Xbox Series X|S",
  ],
  "Football Manager 2021": ["Football Manager 2021 Xbox Edition"],
  Dishonored: [
    "Dishonored® Definitive Edition",
    "Dishonored® Definitive Edition (PC)",
  ],
  DOOM: ["DOOM (1993)"],
  "DOOM II": ["DOOM II (Classic)"],
  "Fallout 4": ["Fallout 4 (PC)"],
  "The Elder Scrolls III: Morrowind": [
    "The Elder Scrolls III: Morrowind Game of the Year Edition (PC)",
  ],
  "The Elder Scrolls IV: Oblivion": [
    "Oblivion",
    "The Elder Scrolls IV: Oblivion Game of the Year Edition (PC)",
  ],
  "The Elder Scrolls V: Skyrim": [
    "The Elder Scrolls V: Skyrim Special Edition",
    "The Elder Scrolls V: Skyrim Special Edition (PC)",
  ],
  "The Evil Within": ["The Evil Within (PC)"],
  "Wolfenstein: The New Order": ["Wolfenstein: The New Order (PC)"],
  "Wolfenstein: The Old Blood": ["Wolfenstein: The Old Blood (PC)"],
  Undertale: ["Undertale (PC)"],
  "Battlefield 3™": ["Battlefield 3 Premium Edition"],
  "Battlefield 4": ["Battlefield 4™ Premium Edition"],
  "Battlefield™ 1": ["Battlefield™ 1 Revolution"],
  "Battlefield™ Hardline": ["Battlefield™ Hardline Ultimate Edition"],
  "Battlefield™ V": ["Battlefield™ V Year 2 Edition"],
  "Crysis 2": ["Crysis® 2 Maximum Edition"],
  "Dragon Age™ 2": ["Dragon Age™ II"],
  "Dragon Age™: Inquisition": [
    "Dragon Age™: Inquisition - Game of the Year Edition",
  ],
  "Dragon Age: Origins": ["Dragon Age™: Origins - Ultimate Edition"],
  "EA SPORTS™ FIFA 17": ["EA SPORTS™ FIFA 17 Standard Edition"],
  "Mass Effect 2": ["Mass Effect™ 2 Digital Deluxe Edition"],
  "Mass Effect™ 3": ["Mass Effect™ 3 N7 Digital Deluxe Edition"],
  "Mass Effect™: Andromeda": ["Mass Effect™: Andromeda Deluxe Edition"],
  "Need for Speed™": ["Need for Speed™ Deluxe Edition"],
  "Need for Speed™ Heat": ["Need for Speed™ Heat Deluxe Edition"],
  "Need for Speed™ Payback": ["Need for Speed™ Payback - Deluxe Edition"],
  "Need for Speed Rivals": ["Need for Speed™ Rivals: Complete Edition"],
  "Plants vs. Zombies: Battle for Neighborville™": [
    "Plants vs. Zombies: Battle for Neighborville™ Deluxe Edition",
  ],
  "Plants vs. Zombies": ["Plants vs. Zombies™ Game of the Year Edition"],
  "Plants vs. Zombies™ Garden Warfare 2": [
    "Plants vs. Zombies™ Garden Warfare 2: Deluxe Edition",
  ],
  "STAR WARS™ Battlefront™ II": [
    "STAR WARS™ Battlefront™ II: Celebration Edition",
  ],
  "STAR WARS™ Battlefront™": ["STAR WARS™ Battlefront™ Ultimate Edition"],
  "The Sims™ 3": ["The Sims™ 3 Starter Pack"],
  "The Sims™ 4": ["The Sims™ 4 Deluxe Party Edition"],
  Titanfall: ["TITANFALL DELUXE EDITION"],
  "Titanfall® 2": ["Titanfall® 2: Ultimate Edition"],
  "Genesis Noir": ["Genesis Noir: Windows Edition"],
  "Pillars of Eternity II: Deadfire": [
    "Pillars of Eternity II: Deadfire - Ultimate Edition",
    "Pillars of Eternity 2: Deadfire - Ultimate Edition (PC)",
  ],
  "Yakuza 6: The Song of Life": ["Yakuza 6: The Song of Life for Windows 10"],
  "MLB® The Show™ 21": [
    "MLB® The Show™ 21 Xbox One",
    "MLB® The Show™ 21 Xbox Series X | S",
  ],
  "Second Extinction™": ["Second Extinction™ (Game Preview)"],
  "DRAGON QUEST BUILDERS™ 2": ["DRAGON QUEST BUILDERS2"],
  "FIFA 20": ["EA SPORTS™ FIFA 20"],
  "FIFA 21": [
    "FIFA 21 Standard Edition Xbox One & Xbox Series X|S",
    "FIFA 21 Xbox One",
    "FIFA 21 Xbox Series X|S",
  ],
  Psychonauts: ["Psychonauts (Windows 10)"],
  "Ryse: Son of Rome": ["Ryse: Legendary Edition"],
  SnowRunner: ["SnowRunner (Windows 10)"],
  "FOR HONOR™": ["FOR HONOR™ Standard Edition"],
  "Darkest Dungeon": ["Darkest Dungeon®", "Darkest Dungeon PC"],
  "Dishonored®: Death of the Outsider™": [
    "Dishonored®: Death of the Outsider™ (PC)",
  ],
  "Fallout 3": ["Fallout 3: Game of the Year Edition"],
  "Fallout: New Vegas": ["Fallout: New Vegas Ultimate Edition"],
  "Medieval Dynasty": ["Medieval Dynasty (Game Preview)"],
  "The Evil Within® 2": ["The Evil Within® 2 (PC)"],
  "Wolfenstein II": [
    "Wolfenstein II: Standard Edition",
    "Wolfenstein® II: The New Colossus™",
  ],
  "Dungeons & Dragons: Dark Alliance": ["Dark Alliance"],
  "Iron Harvest": ["Iron Harvest (Windows)"],
  Prodeus: ["Prodeus (Game Preview)"],
  "Raji: An Ancient Epic": [
    // the letter "c" of "Epic" here is not a regular c
    // but has the char code 1089
    "Raji: An Ancient Epiс",
  ],
  "Microsoft Flight Simulator": [
    "Microsoft Flight Simulator: Standard Edition",
  ],
  "Curse of the Dead Gods": ["Curse of the Dead Gods (PC)"],
  Starmancer: ["Starmancer (Game Preview)"],
};

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
  await scrapCurrentPageAndGoNext(page, scrappedGames);

  await page.click(`[data-theplat="pc"]`);
  await scrapCurrentPageAndGoNext(page, scrappedGames);

  browser.close();

  return scrappedGames;
}

async function scrapCurrentPageAndGoNext(
  page: puppeteer.Page,
  scrappedGames: ScrappedGame[]
): Promise<void> {
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
              console: Boolean(element.querySelector(`[aria-label="Console"]`)),
              pc: Boolean(element.querySelector(`[aria-label="PC"]`)),
            },
          })
        )
    ))
  );

  try {
    await page.waitForTimeout(random(500, 2000));
    await page.click(".paginatenext:not(.pag-disabled) a");

    return scrapCurrentPageAndGoNext(page, scrappedGames);
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
