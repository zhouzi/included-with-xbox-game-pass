import * as React from "react";
import { Layout } from "..";
import storepage from "./assets/storepage.png";
import wishlist from "./assets/wishlist.png";

export function Home() {
  return (
    <Layout>
      <header className="Container Block Header">
        <h1 className="Logo">
          <span className="LogoXGP">xgp</span>
          <span className="LogoDot">.</span>
          <span className="LogoCommunity">community</span>
        </h1>
        <p className="Paragraph">
          Browser extension bringing the Xbox Game Pass to Steam.
        </p>
        <ul className="ListInline">
          <li className="ListInlineItem">
            <a
              href="https://chrome.google.com/webstore/detail/included-with-xbox-game-p/acohddgjcjfelbhaodiebiabljoadldk"
              className="Button ButtonPrimary"
            >
              Add to Chrome
            </a>
          </li>
          <li className="ListInlineItem">
            <a
              href="https://addons.mozilla.org/addon/included-with-xbox-game-pass/"
              className="Button ButtonPrimary"
            >
              Add to Firefox
            </a>
          </li>
        </ul>
      </header>
      <main className="Container Main">
        <section id="extension">
          <article className="Block">
            <img src={storepage} alt="" className="Image" />
            <h2 className="Heading2">
              Do not buy a game you already have access to
            </h2>
            <p className="Paragraph">
              There is no way you're mistakenly buying a game again with the
              "Included with Xbox Game Pass" block appearing above the purchase
              options.
            </p>
          </article>
          <article className="Block">
            <img src={wishlist} alt="" className="Image" />
            <h2 className="Heading2">Review your wishlist</h2>
            <p className="Paragraph">
              You might be waiting on a sale while you can already be playing
              games from your wishlist. With this extension you can tell at
              first glance.
            </p>
          </article>
        </section>
        <section className="Block">
          <ul className="ListInline">
            <li className="ListInlineItem">
              <a
                href="https://chrome.google.com/webstore/detail/included-with-xbox-game-p/acohddgjcjfelbhaodiebiabljoadldk"
                className="Button ButtonPrimary"
              >
                Add to Chrome
              </a>
            </li>
            <li className="ListInlineItem">
              <a
                href="https://addons.mozilla.org/addon/included-with-xbox-game-pass/"
                className="Button ButtonPrimary"
              >
                Add to Firefox
              </a>
            </li>
          </ul>
        </section>
        <section id="newsletter" className="Block Newsletter">
          <div className="NewsletterContent">
            <h3 className="Heading3">Weekly digest in your inbox</h3>
            <p className="Paragraph">
              Subscribe to the weekly newsletter to stay updated on new and
              upcoming games.
            </p>
          </div>
          <div className="NewsletterAction">
            <a
              href="https://de93a9ef.sibforms.com/serve/MUIEANlN866pLXN8kcim9KKMHty8jYmnSazB4v66hfzxvglWPGywDMW-4BHfiGdARFGgu4DI43uWInJkCWYtYXe-Y6DZnsblnnw5f9ah65wH1r2g9-HYqd_iNbY8TXjVS5eRM7uiC7VRAunj2_wnDaLZTKHE7tANJjUtGbivbYSxgQAToEAw8elGjlPCCGTkXLzZpBwpYeU8RgAW"
              className="Button ButtonSecondary"
            >
              Subscribe
            </a>
          </div>
        </section>
      </main>
      <footer className="Container Block Footer">
        <p className="Paragraph">
          xgp.community is an
          <a
            href="https://github.com/zhouzi/included-with-xbox-game-pass"
            className="Link"
          >
            open source
          </a>
          side project by
          <a href="https://gabinaureche.com" className="Link">
            Gabin
          </a>
          . Do not hesitate to get in touch by sending me at email at
          <a href="mailto:gabin@xgp.community" className="Link">
            gabin@xgp.community
          </a>
          .
        </p>
        <p className="Paragraph">
          Also, the best way to be part of the community is by joining the Xbox
          Game Pass subreddit:
          <a href="https://reddit.com/r/xboxgamepass" className="Link">
            /r/xboxgamepass
          </a>
          . Regarding the latest news, Microsoft usually posts them on
          <a href="https://twitter.com/xboxgamepass" className="Link">
            Twitter
          </a>
          and/or on their
          <a
            href="https://news.xbox.com/en-us/xbox-game-pass/"
            className="Link"
          >
            blog
          </a>
          .
        </p>
      </footer>
    </Layout>
  );
}
