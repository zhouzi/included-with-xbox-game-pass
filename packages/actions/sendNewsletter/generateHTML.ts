import path from "path";
import fse from "fs-extra";
import { format } from "date-fns";
import handlebars from "handlebars";
import mjml from "mjml";

import { Game, Post } from "../../types";

interface NewsletterGame {
  url: string;
  name: string;
  availability: string;
}

export interface TemplateParams {
  games: NewsletterGame[];
  gamesCountIsOdd: boolean;
  posts: Post[];
}

export async function getTemplateParams({
  games,
  posts,
}: {
  games: Game[];
  posts: Post[];
}): Promise<TemplateParams> {
  return {
    games: games.map((game) => ({
      url: game.url,
      name: game.name,
      availability: [
        game.availability.pc && "PC",
        game.availability.console && "Console",
      ]
        .filter(Boolean)
        .join(", "),
    })),
    gamesCountIsOdd: games.length % 2 !== 0,
    posts,
  };
}

export function isEmptyTemplateParams(templateParams: TemplateParams): boolean {
  return templateParams.games.length === 0 && templateParams.posts.length === 0;
}

export async function generateHTML(params: TemplateParams): Promise<string> {
  const template = await fse.readFile(
    path.join(__dirname, "template.mjml"),
    "utf8"
  );
  const render = handlebars.compile(template);
  const { html, errors } = mjml(render(params), {
    minify: true,
  });

  if (errors.length > 0) {
    console.error(errors);
    throw new Error("Failed to generate HTML from mjml template");
  }

  return html;
}
