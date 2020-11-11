import mjml from "mjml";
import { Game } from "@xgp/types";

export function createNewsletterTemplate({ newGames }: { newGames: Game[] }) {
  return mjml(
    `
  <mjml>
    <mj-head>
      <mj-style inline="inline">
        html,
        body {
          background-color: #0F1923;
        }
  
        p {
          font-size: 14px;
          line-height: 1.4;
          color: #BAC5CE;
          margin: 0;
        }
  
        a {
          color: #44F089;
        }
  
        .SectionTitle {
          text-transform: uppercase;
          font-size: 12px;
          font-weight:
            bold;
          letter-spacing: 0.6px;
          color: #fff;
        }
  
        h2 {
          color: #fff;
          font-size: 16px;
          font-weight: bold;
          margin: 0;
          line-height: 1.2;
        }
      </mj-style>
    </mj-head>
    <mj-body>
      <mj-section padding="20px 0 30px 0">
        <mj-column>
          <mj-image src="https://xgp.community/images/logo.png" width="187px" padding="0" align="left" />
          <mj-text padding="6px 0 0 0">
            <p>New games added to the Xbox Game Pass and announcements.</p>
          </mj-text>
        </mj-column>
      </mj-section>
  
      ${
        newGames.length > 0
          ? `
        <mj-section padding="0 0 30px 0">
          <mj-column width="100%">
            <mj-text padding="0 0 10px 0">
              <p class="SectionTitle">New games</p>
            </mj-text>
          </mj-column>
          ${newGames
            .map(
              (game) => `
            <mj-column width="50%" padding="0 0 10px 0">
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
            .join("")}
          ${
            newGames.length % 2 !== 0
              ? `<mj-column width="50%" padding="0 0 10px 0"></mj-column>`
              : ""
          }
        </mj-section>
      `
          : ""
      }
  
      <mj-section padding="0">
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
}
