# [xgp.community](https://xgp.community)

Browser extension bringing the Xbox Game Pass to Steam.

- [Add to Chrome](https://chrome.google.com/webstore/detail/included-with-xbox-game-p/acohddgjcjfelbhaodiebiabljoadldk)
- [Add to Firefox](https://addons.mozilla.org/addon/included-with-xbox-game-pass/)

## Installation

Here's how you can get a copy of xgp.community running on your machine:

1. Clone this repository
2. Run `npm install` in its directory
3. Run `npm start` to start the application

You can now load the unpacked extension from the `dist/` directory.
You can access the website at http://localhost:1234

## Contributing

All contributions are welcome!
I try to track everything through the issues so you might find something cool to work on there.
Feel free to submit your suggestions, though.

### How it works

Although this project is splitted into several packages, it doesn't use any fancy tools behind the scene.
It really is just a Node project with sub-directories.
Scripts, dependencies & stuff are all listed in the root `package.json`.
Here's an introduction to these packages:

- `packages/actions` contains scripts that are run on regular basis via GitHub's actions. For example, that's where you can find the code that pulls the list of game from Xbox Game Pass' website (once a day, everyday).
- `packages/extension` contains the source for the browser extension. It's based on WebExtension so it works in both Chrome and Firefox without platform-specific code.
- `packages/gh-pages` contains the old API, before I bought the xgp.community domain. There are still people out there using a version of the extension that fetches the list of games from the old URL.
- `packages/xgp.community` contains the source for the website. There are no build steps, it's pure HTML and CSS.

## License

[MIT](LICENSE)
