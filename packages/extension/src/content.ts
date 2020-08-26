import { getXGPGame } from "./getXGPGame";
import { injectBadge } from "./injectBadge";

(async () => {
  const game = await getXGPGame(
    (window.document.querySelector(".apphub_AppName") as HTMLElement)
      .textContent!
  );
  injectBadge(game);
})();
