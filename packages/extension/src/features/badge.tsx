import React from "dom-chef";
import { APIGame } from "@included-with-xbox-game-pass/types";
import { RouteName } from "../routes";
import getGame from "../getGame";

function XboxLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
    >
      <path
        d="M5.406 11.96a5.961 5.961 0 01-2.664-.94c-.676-.442-.828-.622-.828-.98 0-.724.797-1.99 2.16-3.435.774-.82 1.856-1.78 1.973-1.753.226.05 2.039 1.812 2.719 2.644 1.07 1.313 1.566 2.39 1.316 2.867-.191.367-1.375 1.078-2.242 1.352a6.592 6.592 0 01-2.434.246zM1.004 9.29C.44 8.43.16 7.585.024 6.362c-.047-.402-.032-.633.101-1.46.164-1.032.754-2.223 1.46-2.958.302-.312.33-.32.696-.195.446.148.922.477 1.66 1.145l.434.386-.238.29c-1.09 1.34-2.246 3.234-2.68 4.41-.234.636-.332 1.277-.23 1.546.07.18.007.114-.223-.238zm9.836.144c.055-.27-.016-.766-.18-1.266-.355-1.078-1.543-3.09-2.633-4.457l-.343-.434.37-.34c.485-.44.821-.707 1.184-.933.29-.18.7-.336.875-.336.106 0 .489.395.797.828.48.668.832 1.477 1.008 2.32.117.547.125 1.715.02 2.258a7.062 7.062 0 01-.45 1.418c-.136.293-.468.867-.617 1.051-.074.098-.074.098-.031-.11zM5.508 1.46C5.004 1.207 4.227.934 3.797.859a3.397 3.397 0 00-.57-.03c-.352.019-.336 0 .23-.27A6.127 6.127 0 014.855.094c.602-.125 1.735-.125 2.325 0 .64.133 1.39.41 1.816.672l.125.078-.289-.016c-.574-.027-1.41.203-2.312.64a6.13 6.13 0 01-.524.235 10.948 10.948 0 01-.488-.242zm0 0"
        fill="currentColor"
      />
    </svg>
  );
}

export function containsBadge(element: HTMLElement): boolean {
  return (
    element.querySelector("[data-included-with-xbox-game-pass-badge]") != null
  );
}

export function createBadge(
  game: APIGame | null,
  style: Record<string, string> = {}
) {
  const baseStyle = {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "2px",
  };

  if (game) {
    return (
      <a
        data-included-with-xbox-game-pass-badge="true"
        href={game.url}
        style={{
          ...baseStyle,
          ...style,
          color: "#fff",
          backgroundColor: "#098a43",
        }}
      >
        <XboxLogo style={{ marginRight: "6px" }} /> Included with Xbox Game Pass
      </a>
    );
  }

  return (
    <span
      data-included-with-xbox-game-pass-badge="true"
      style={{
        ...baseStyle,
        ...style,
        color: "#8f98a0",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
      }}
    >
      <XboxLogo style={{ marginRight: "6px" }} /> Not included with Xbox Game
      Pass
    </span>
  );
}

export default async function badge(currentRoute: RouteName) {
  if (currentRoute !== RouteName.storePage) {
    return;
  }

  const appName = window.document.querySelector(".apphub_AppName")!;
  const game = await getGame(appName.textContent!);

  appName.parentNode!.insertBefore(
    createBadge(game, { margin: "6px 0 8px 0" }),
    appName.nextSibling
  );
}
