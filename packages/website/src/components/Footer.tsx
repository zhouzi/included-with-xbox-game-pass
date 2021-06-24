import * as React from "react";

export function Footer() {
  return (
    <footer className="Container Block Footer">
      <p className="Paragraph">
        included-with-xbox-game-pass is an{" "}
        <a
          href="https://github.com/zhouzi/included-with-xbox-game-pass"
          className="Link"
        >
          open source
        </a>{" "}
        side project by{" "}
        <a href="https://gabinaureche.com" className="Link">
          Gabin
        </a>
        . Do not hesitate to get in touch by sending me at email at{" "}
        <a href="mailto:hello@gabinaureche.com" className="Link">
          hello@gabinaureche.com
        </a>
        .
      </p>
      <p className="Paragraph">
        Also, the best way to be part of the community is by joining the Xbox
        Game Pass subreddit:{" "}
        <a href="https://reddit.com/r/xboxgamepass" className="Link">
          /r/xboxgamepass
        </a>
        . Regarding the latest news, Microsoft usually posts them on{" "}
        <a href="https://twitter.com/xboxgamepass" className="Link">
          Twitter
        </a>{" "}
        and/or on their{" "}
        <a href="https://news.xbox.com/en-us/xbox-game-pass/" className="Link">
          blog
        </a>
        .
      </p>
    </footer>
  );
}
