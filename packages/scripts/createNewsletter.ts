import mjml from "mjml";
import axios from "axios";
import path from "path";
import fse from "fs-extra";
import { format } from "date-fns";
import { Game, Post } from "@xgp/types";

import posts from "../xgp.community/static/api/posts.json";
import games from "../xgp.community/static/api/games.json";

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "xgp.community",
  "static",
  "newsletter"
);
const IS_DEV = ["--dev", "-D"].includes(process.argv[2]);

(async function createNewsletter() {
  let since = new Date();
  since.setDate(since.getDate() - 7);

  if (!IS_DEV) {
    if (process.env.SENDINBLUE_API_KEY == null) {
      throw new Error("Missing SENDINBLUE_API_KEY environment variable");
    }

    const {
      data: { campaigns },
    } = await axios.get<{ campaigns: Array<{ createdAt: string }> }>(
      "/emailCampaigns",
      {
        params: {
          status: "sent",
          limit: 1,
        },
        baseURL: "https://api.sendinblue.com/v3/",
        headers: {
          "api-key": process.env.SENDINBLUE_API_KEY,
        },
      }
    );
    const lastCampaign = campaigns[0];
    since = new Date(lastCampaign.createdAt);
  }

  const newGames: Game[] = games.filter(
    (game) => new Date(game.addedAt).getTime() > since.getTime()
  );
  const newPosts: Post[] = posts.filter(
    (post) => new Date(post.publishedAt).getTime() > since.getTime()
  );
  const { html, errors } = mjml(
    `
  <mjml>
    <mj-head>
      <mj-style inline="inline">
        p {
          color: #BAC5CE;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }
        strong {
          color: #fff;
          font-weight: bold;
        }

        a {
          color: #fff;
          text-decoration: none;
        }

        .Introduction {
          font-size: 16px;
        }

        .SectionTitle {
          text-transform: uppercase;
          font-size: 12px;
          font-weight:
            bold;
          letter-spacing: 0.6px;
          color: #44f089;
        }

        h2 {
          color: #fff;
          font-size: 18px;
          font-weight: bold;
          margin: 0;
          line-height: 1.3;
        }
      </mj-style>
    </mj-head>
    <mj-body background-color="#0F1923">
      <mj-section padding="28px 14px 0 14px">
        <mj-column>
          <mj-image href="https://xgp.community" src="https://xgp.community/images/logo.png" width="187px" padding="0" align="left" />
          <mj-text padding="6px 0 0 0">
            <p>New games and announcements for Xbox Game Pass members.</p>
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="28px 14px 0 14px">
        <mj-column padding="14px" background-color="#182735" border-radius="6px">
          <mj-text padding="0 0 14px 0">
            <p class="Introduction">
              This week quality won over quantity with the addition a few great games! And there's more <a href="https://www.reddit.com/r/XboxGamePass/comments/k4q7qd/coming_soon/">coming soon</a>.
            </p>
          </mj-text>
          <mj-text padding="0 0 14px 0">
            <p class="Introduction">
              The Xbox Game Pass has a bright future with EA Play that's already available on console but coming to PC on December, 15. And with Bethesda being bought by Microsoft, we can hope to see their games added early-mid 2021.
            </p>
          </mj-text>
          <mj-text padding="0 0 14px 0">
            <p class="Introduction">
              In other news, someone made a <a href="https://www.reddit.com/r/XboxGamePass/comments/k5zos5/gamepass_vs_psnow_a_great_comparison/">comparison of PSNow / Xbox Game Pass</a> and you can currently get <a href="https://www.microsoft.com/en-us/p/xbox-game-pass-ultimate/cfq7ttc0khs0?activetab=pivot%3aoverviewtab">3 months of Xbox Game Pass Ultimate for 1$</a>.
            </p>
          </mj-text>
        </mj-column>
      </mj-section>

      ${
        newPosts.length > 0
          ? `
        <mj-section padding="28px 14px 14px 14px">
          <mj-column>
            <mj-text padding="0">
              <p class="SectionTitle">New posts</p>
            </mj-text>
          </mj-column>
        </mj-section>
        ${newPosts
          .map(
            (post) => `
        <mj-section padding="0 14px 14px 14px">
          <mj-column width="75%">
            <mj-text padding="0 14px 14px 0">
              <h2><a href="${post.url}">${post.title}</a></h2>
              <p>${format(new Date(post.publishedAt), "MMM d, y")}</p>
            </mj-text>
          </mj-column>
          <mj-column width="25%">
            <mj-image
              padding="0"
              width="100px"
              href="${post.url}"
              src="${post.image}"
            ></mj-image>
          </mj-column>
        </mj-section>
        `
          )
          .join("\n")}
      `
          : ""
      }

      ${
        newGames.length > 0
          ? `
        <mj-section padding="14px 14px 0 14px">
          <mj-column width="100%">
            <mj-text padding="0 0 14px 0">
              <p class="SectionTitle">New games</p>
            </mj-text>
          </mj-column>
          ${newGames
            .map(
              (game) => `
            <mj-column width="50%" padding="0 14px 14px 0">
              <mj-text padding="0">
                <h2><a href="${game.url}">${game.name}</a></h2>
                <p>Available on: ${[
                  game.availability.pc && "PC",
                  game.availability.console && "Console",
                ]
                  .filter(Boolean)
                  .join(", ")}</p>
              </mj-text>
            </mj-column>
          `
            )
            .join("\n")}
          ${
            newGames.length % 2 !== 0
              ? `<mj-column width="50%" padding="0 0 14px 0"></mj-column>`
              : ""
          }
        </mj-section>
      `
          : ""
      }

      <mj-section padding="28px 14px 28px 14px">
        <mj-column>
          <mj-text padding="0">
            <p>
              This newsletter is part of <a href="https://xgp.community">xgp.community</a>, a side
              project by <a href="https://gabinaureche.com">Gabin</a>. Do not hesitate to reply to this
              email if you have any feedback to share.
            </p>
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `,
    {
      minify: true,
    }
  );

  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.formattedMessage).join("\n"));
  }

  await fse.writeFile(path.join(OUTPUT_DIR, "next.html"), html);
})();
