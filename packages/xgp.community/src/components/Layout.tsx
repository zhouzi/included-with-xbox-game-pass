import * as React from "react";
import { Helmet } from "react-helmet";
import { createGlobalStyle } from "styled-components";
import "modern-normalize/modern-normalize.css";

const GlobalStyle = createGlobalStyle`
  :root {
    --color-primary: #44f089;
    --color-primary-dark: #24cc67;
    --color-background-dark: #050f1a;
    --color-background-main-over: #bac5ce;
    --color-background-main-over-emphasis: #fff;
    --color-background-main: #0f1923;
    --color-background-light: #182735;
    --color-background-lighter: #314253;
  }

  html {
    font-size: 16px;
  }

  body {
    font-family: "Work Sans", sans-serif;
    font-weight: 300;
    line-height: 1.6;
  }

  body {
    color: var(--color-background-main-over);
    background-color: var(--color-background-main);
  }

  .Container {
    max-width: 40rem;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .Header {
    padding-top: 1rem;
  }

  .Logo {
    display: flex;
    margin: 0;
    font-style: italic;
    font-weight: 800;
    line-height: 1.2;
  }
  .LogoDot {
    color: var(--color-background-lighter);
  }
  .LogoXGP {
    color: var(--color-primary);
  }
  .LogoCommunity {
    color: var(--color-background-main-over-emphasis);
  }

  .Heading2,
  .Heading3,
  .Paragraph,
  .List,
  .ListInline {
    margin: 0 0 1rem 0;
  }
  .Heading2:last-child,
  .Heading3:last-child,
  .Paragraph:last-child,
  .List:last-child,
  .ListInline:last-child {
    margin-bottom: 0;
  }

  .Heading2,
  .Heading3 {
    line-height: 1.2;
    color: var(--color-background-main-over-emphasis);
  }
  .Heading2 {
    font-size: 1.4rem;
  }
  .Heading3 {
    font-size: 1.2rem;
  }

  .Newsletter {
    padding: 1.5rem;
    border-radius: 6px;
    background-color: var(--color-background-light);
  }
  .NewsletterContent {
    margin-bottom: 1rem;
  }
  .NewsletterAction {
  }
  @media (min-width: 46rem) {
    .Newsletter {
      display: flex;
    }
    .NewsletterContent {
      padding-right: 1rem;
      margin-bottom: 0;
    }
  }

  .Footer {
    font-size: 0.8rem;
  }

  .Link {
    color: var(--color-background-main-over-emphasis);
    font-weight: 600;
    text-decoration: underline;
  }
  .Link:focus,
  .Link:hover {
    color: var(--color-primary);
  }

  .Input,
  .Button {
    font: inherit;
    color: inherit;
    padding: 0.6rem 1rem;
    background: transparent;
    border: 0;
    border-radius: 2px;
  }

  .Input {
    display: block;
    width: 100%;
    color: var(--color-background-main-over-emphasis);
    background-color: var(--color-background-lighter);
  }
  .Input::placeholder {
    color: var(--color-background-main-over);
  }

  .Button {
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    display: inline-block;
  }
  .ButtonPrimary {
    color: var(--color-background-main);
    background-color: var(--color-primary);
  }
  .ButtonPrimary:focus,
  .ButtonPrimary:hover {
    background-color: var(--color-primary-dark);
  }
  .ButtonSecondary {
    color: var(--color-background-main);
    background-color: var(--color-background-main-over-emphasis);
  }
  .ButtonSecondary:focus,
  .ButtonSecondary:hover {
    background-color: var(--color-background-main-over);
  }

  .ListInline {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
  }
  .ListInlineItem {
    margin-right: 1rem;
  }
  .ListInlineItem:last-child {
    margin-right: 0;
  }

  .Block {
    margin-bottom: 4rem;
  }

  .Image {
    display: block;
    width: 100%;
    height: auto;
    margin: 0 0 1rem 0;
    background-color: var(--color-background-dark);
  }
  @media (min-width: 46rem) {
    .Image {
      width: calc(100% + 6rem);
      margin-left: -3rem;
      margin-right: -3rem;
    }
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout(props: LayoutProps) {
  return (
    <>
      <GlobalStyle />
      <Helmet
        title="xgp.community"
        meta={[
          { name: "title", property: "og:title", content: "xgp.community" },
          {
            name: "description",
            property: "og:description",
            content: "Browser extension bringing the Xbox Game Pass to Steam.",
          },
        ]}
        link={[
          {
            rel: "stylesheet",
            href:
              "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,300;0,600;1,800&display=swap",
          },
        ]}
      />
      {props.children}
    </>
  );
}
