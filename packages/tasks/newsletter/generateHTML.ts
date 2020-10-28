import path from "path";
import fse from "fs-extra";
import handlebars from "handlebars";
import mjml from "mjml";
import { GameItem, MicrosoftAnnouncementItem } from "./types";

interface TemplateParams {
  recentGames: GameItem[];
  releasedSoonGames: GameItem[];
  microsoftAnnouncements: MicrosoftAnnouncementItem[];
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
