import React from "dom-chef";
import { RouteName } from "../routes";
import { CachedGame } from "../getGames";
import getGame from "../getGame";
import { XboxLogo } from "./badge";

function createPlayButton(game: CachedGame) {
  return (
    <div className="game_area_purchase_game_wrapper game_purchase_sub_dropdown">
      <div className="game_area_already_owned master_sub">
        <div className="master_sub" style={{ color: "white" }}>
          <XboxLogo />
          &nbsp;Xbox Game Pass
        </div>
        <div className="already_in_library_master_sub">
          <a
            href="https://www.xbox.com/en-US/xbox-game-pass/"
            className="already_in_library_browse"
          >
            Learn more about Xbox Game Pass
          </a>
        </div>
      </div>
      <div className="game_area_purchase_game_dropdown_subscription game_area_purchase_game">
        <div className="game_area_purchase_platform">
          <span className="platform_img win" />
        </div>
        <h1>Included with Xbox Game Pass</h1>
        <div className="game_area_purchase_game_dropdown_description">
          Get access to over 100 high-quality games with new titles added all
          the time. Play directly on console, PC and—coming soon—Android mobile
          devices from the cloud (Beta).
        </div>
        <div className="game_area_purchase_game_dropdown_right_panel">
          <div className="game_purchase_action_bg">
            <div className="btn_addtocart">
              <a
                href={game.availability.pc}
                className="btn_green_steamui btn_medium"
              >
                <span>Play</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function playButton(currentRoute: RouteName) {
  if (currentRoute !== RouteName.storePage) {
    return;
  }

  const appName = window.document.querySelector(".apphub_AppName")!;
  const game = await getGame(appName.textContent!);

  if (game == null) {
    return null;
  }

  const gamePurchaseArea = window.document.getElementById(
    "game_area_purchase"
  )!;
  gamePurchaseArea.prepend(createPlayButton(game));
}
