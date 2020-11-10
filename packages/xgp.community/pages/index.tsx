import * as React from "react";
import classNames from "classnames";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <>
      <header
        className={classNames([styles.Container, styles.Block, styles.Header])}
      >
        <h1 className={styles.Logo}>
          <span className={styles.LogoXGP}>xgp</span>
          <span className={styles.LogoDot}>.</span>
          <span className={styles.LogoCommunity}>community</span>
        </h1>
        <p className={styles.Paragraph}>
          Browser extension bringing the Xbox Game Pass to Steam.
        </p>
        <ul className={styles.ListInline}>
          <li className={styles.ListInlineItem}>
            <a
              href="https://chrome.google.com/webstore/detail/included-with-xbox-game-p/acohddgjcjfelbhaodiebiabljoadldk"
              className={classNames(styles.Button, styles.ButtonPrimary)}
            >
              Add to Chrome
            </a>
          </li>
          <li className={styles.ListInlineItem}>
            <a
              href="https://addons.mozilla.org/addon/included-with-xbox-game-pass/"
              className={classNames(styles.Button, styles.ButtonPrimary)}
            >
              Add to Firefox
            </a>
          </li>
        </ul>
      </header>
      <main className={classNames([styles.Container, styles.Main])}>
        <section id="extension">
          <article className={styles.Block}>
            <img src="images/storepage.png" alt="" className={styles.Image} />
            <h2 className={styles.Heading2}>
              Do not buy a game you already have access to
            </h2>
            <p className={styles.Paragraph}>
              There is no way you're mistakenly buying a game again with the
              "Included with Xbox Game Pass" block appearing above the purchase
              options.
            </p>
          </article>

          <article className={styles.Block}>
            <img src="images/wishlist.png" alt="" className={styles.Image} />
            <h2 className={styles.Heading2}>Review your wishlist</h2>
            <p className={styles.Paragraph}>
              You might be waiting on a sale while you can already be playing
              games from your wishlist. With this extension you can tell at
              first glance.
            </p>
          </article>
        </section>
        <section className={styles.Block}>
          <ul className={styles.ListInline}>
            <li className={styles.ListInlineItem}>
              <a
                href="https://chrome.google.com/webstore/detail/included-with-xbox-game-p/acohddgjcjfelbhaodiebiabljoadldk"
                className={classNames(styles.Button, styles.ButtonPrimary)}
              >
                Add to Chrome
              </a>
            </li>
            <li className={styles.ListInlineItem}>
              <a
                href="https://addons.mozilla.org/addon/included-with-xbox-game-pass/"
                className={classNames(styles.Button, styles.ButtonPrimary)}
              >
                Add to Firefox
              </a>
            </li>
          </ul>
        </section>
        <section
          id="newsletter"
          className={classNames([styles.Block, styles.Newsletter])}
        >
          <div className={styles.NewsletterContent}>
            <h3 className={styles.Heading3}>Weekly digest in your inbox</h3>
            <p className={styles.Paragraph}>
              Subscribe to the weekly newsletter to stay updated on new and
              upcoming games.
            </p>
          </div>
          <div className={styles.NewsletterAction}>
            <a
              href="https://de93a9ef.sibforms.com/serve/MUIEANlN866pLXN8kcim9KKMHty8jYmnSazB4v66hfzxvglWPGywDMW-4BHfiGdARFGgu4DI43uWInJkCWYtYXe-Y6DZnsblnnw5f9ah65wH1r2g9-HYqd_iNbY8TXjVS5eRM7uiC7VRAunj2_wnDaLZTKHE7tANJjUtGbivbYSxgQAToEAw8elGjlPCCGTkXLzZpBwpYeU8RgAW"
              className={classNames(styles.Button, styles.ButtonSecondary)}
            >
              Subscribe
            </a>
          </div>
        </section>
      </main>
      <footer
        className={classNames([styles.Container, styles.Block, styles.Footer])}
      >
        <p className={styles.Paragraph}>
          xgp.community is an{" "}
          <a
            href="https://github.com/zhouzi/included-with-xbox-game-pass"
            className={styles.Link}
          >
            open source
          </a>{" "}
          side project by{" "}
          <a href="https://gabinaureche.com" className={styles.Link}>
            Gabin
          </a>
          . Do not hesitate to get in touch by sending me at email at{" "}
          <a href="mailto:gabin@xgp.community" className={styles.Link}>
            gabin@xgp.community
          </a>
          .
        </p>
        <p className={styles.Paragraph}>
          Also, the best way to be part of the community is by joining the Xbox
          Game Pass subreddit:{" "}
          <a href="https://reddit.com/r/xboxgamepass" className={styles.Link}>
            /r/xboxgamepass
          </a>
          . Regarding the latest news, Microsoft usually posts them on{" "}
          <a href="https://twitter.com/xboxgamepass" className={styles.Link}>
            Twitter
          </a>{" "}
          and/or on their{" "}
          <a
            href="https://news.xbox.com/en-us/xbox-game-pass/"
            className={styles.Link}
          >
            blog
          </a>
          .
        </p>
      </footer>
    </>
  );
}
