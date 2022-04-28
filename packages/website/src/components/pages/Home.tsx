import * as React from "react";
import { Layout, Header, Footer } from "..";
import storepage from "./assets/storepage.png";
import wishlist from "./assets/wishlist.png";

export function Home() {
  return (
    <Layout>
      <Header>
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
      </Header>
      <main className="Container Main">
        <section>
          <article className="Block">
            <h2 className="Heading2">This extension is unmaintained</h2>
            <p className="Paragraph">
              I am personnaly using{" "}
              <a
                href="https://aligueler.com/SubscriptionInfo/"
                className="Link"
              >
                Alike03's extension
              </a>{" "}
              which does what this extension used to do and much more.
            </p>
          </article>
        </section>
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
      </main>
      <Footer />
    </Layout>
  );
}
