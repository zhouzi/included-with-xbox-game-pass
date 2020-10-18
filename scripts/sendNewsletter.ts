import sendgrid from "@sendgrid/mail";
import games from "../packages/gh-pages/games.json";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

const aWeekAgo = new Date();
aWeekAgo.setDate(aWeekAgo.getDate() - 7);

const newGames = games.filter(
  (game) => new Date(game.addedAt).getTime() > aWeekAgo.getTime()
);

const now = Date.now();
const unreleasedGames = games.filter(
  (game) => new Date(game.releaseDate).getTime() > now
);

const inTwoWeeks = new Date();
inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

const gamesReleasedSoon = unreleasedGames.filter(
  (game) => new Date(game.releaseDate).getTime() < inTwoWeeks.getTime()
);

(async () => {
  if (newGames.length <= 0 && gamesReleasedSoon.length <= 0) {
    return;
  }

  const subject = `XGP: ${[
    newGames.length > 0 ? `${newGames.length} games added` : null,
    gamesReleasedSoon.length > 0
      ? `${gamesReleasedSoon.length} games coming out`
      : null,
  ]
    .filter(Boolean)
    .join(", ")}`;
  const text = `${[
    newGames.length > 0
      ? `${newGames.map((game) => game.name).join(", ")} were added this week.`
      : null,
    gamesReleasedSoon.length > 0
      ? `${gamesReleasedSoon.length} games are coming soon.`
      : null,
  ]
    .filter(Boolean)
    .join("\n")}`;

  await sendgrid.send({
    to: "hello@gabinaureche.com",
    from: "hello@gabinaureche.com",
    subject,
    text,
    html: text,
  });
})();
