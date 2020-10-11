import { RouteName } from "../routes";
import getGame from "../getGame";
import { createBadge, containsBadge } from "./badge";

export default async function wishList(currentRoute: RouteName) {
  if (currentRoute !== RouteName.wishlist) {
    return;
  }

  const parent = window.document.getElementById("wishlist_ctn")!;

  const observer = new MutationObserver(async (mutationsList) => {
    const addedGames = mutationsList.reduce<HTMLElement[]>(
      (acc, mutationList) =>
        acc.concat(
          (Array.from(mutationList.addedNodes) as HTMLElement[]).filter(
            (addedNode) =>
              addedNode instanceof HTMLElement &&
              addedNode.matches(".wishlist_row") &&
              !containsBadge(addedNode)
          )
        ),
      []
    );

    for (const addedGame of addedGames) {
      const title = addedGame.querySelector(".title")!;
      const game = await getGame(title.textContent!.trim());

      if (game) {
        addedGame.querySelector(".platform_icons")!.prepend(
          createBadge(game, {
            marginRight: "6px",
          })
        );
      }
    }
  });
  observer.observe(parent, {
    childList: true,
  });
}
