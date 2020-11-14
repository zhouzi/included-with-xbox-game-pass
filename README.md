# [xgp.community](https://xgp.community)

Browser extension bringing the Xbox Game Pass to Steam.

- [Add to Chrome](https://chrome.google.com/webstore/detail/included-with-xbox-game-p/acohddgjcjfelbhaodiebiabljoadldk)
- [Add to Firefox](https://addons.mozilla.org/addon/included-with-xbox-game-pass/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/998c8213-1a89-4e9a-ae3c-d74798ad3e0a/deploy-status)](https://app.netlify.com/sites/xgp/deploys)

## Installation

Here's how you can get a copy of xgp.community running on your machine:

1. Clone this repository
2. Run `yarn` in its directory

## Contributing

All contributions are welcome!
The issues are usually a good place to find something to contribute to.
Feel free to suggest your ideas, though.

### How it works

This repository contains the source of the browser extension along with a few other things.
Here is an introduction to each of the packages:

- `packages/extension`: code for the browser extension.
- `packages/gh-pages`: the website used to be hosted on GitHub, before I bought the xgp.community domain. The `games.json` file is still served that way to not break the extension for previous users.
- `packages/scripts`: contains scripts that are usually run through GitHub actions.
- `packages/types`: contains types that are shared across the packages.
- `packages/xgp.community`: contains the source of the website.

## License

[MIT](LICENSE)
