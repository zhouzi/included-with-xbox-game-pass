import React from "dom-chef";
import { APIGame } from "@included-with-xbox-game-pass/types";
import { RouteName } from "../routes";
import getGame from "../getGame";

function createPlayButton(game: APIGame) {
  return (
    <div className="game_area_purchase_game_wrapper">
      <div className="game_area_purchase_game">
        <h1>Play with the Xbox Game Pass</h1>
        <div className="game_purchase_action">
          <div className="game_purchase_action_bg">
            <div className="game_purchase_price price">Included</div>
            <div className="btn_addtocart">
              <a className="btn_green_steamui btn_medium" href={game.url}>
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
