# Flutter Links for VS Code

[![Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/djbkwon.flutter-dependency-docs?style=flat-square&label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=djbkwon.flutter-dependency-docs)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/djbkwon.flutter-dependency-docs?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=djbkwon.flutter-dependency-docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Effortlessly view your Flutter package dependencies on [pub.dev](https://pub.dev) directly within Visual Studio Code. This extension adds convenient links and a toggle right where you need them.

![Screenshot showing CodeLenses above dependencies](https://raw.githubusercontent.com/danieljbk/flutter-links/main/img/view-package.png)
*(Screenshot needs update to show toggle button)*

## Features

*   **CodeLens Links:** Displays a clickable `pub.dev/packages/...` link directly above each dependency listed in your `pubspec.yaml` file (`dependencies`, `dev_dependencies`, `dependency_overrides`).
*   **Quick Toggle:** Easily show or hide the CodeLens links using a convenient toggle button (👁️ / 👁️‍🗨️) in the editor's title bar when viewing `pubspec.yaml`.
*   **Configurable Base URL:** Optionally change the base URL used for links via VS Code settings (useful for private package repositories that mimic the pub.dev API structure).
*   **Lightweight:** Focused solely on providing dependency links without unnecessary overhead.

## Usage

1.  Install the "Flutter Links" extension from the VS Code Marketplace.
2.  Open a Flutter project containing a `pubspec.yaml` file.
3.  CodeLenses with links to `pub.dev` will appear above the dependencies.
4.  Click a CodeLens link to open the corresponding package page in your browser.
5.  Use the eye icon (👁️ / 👁️‍🗨️) button in the editor's title bar (top-right) to toggle the visibility of these links on demand.
6.  A brief notification will confirm the enabled/disabled state when toggling.

## Configuration

*   `flutterLinks.baseUrl`: (Optional) Set a custom base URL if you need to point links to a different package repository.
    *   **Default:** `"https://pub.dev/"`
    *   **Example:** `"https://my-private-repo.com/api/"` (Ensure your repo structure matches `/packages/<name>`)

    You can configure this in your User or Workspace `settings.json`:
    ```json
    {
      "flutterLinks.baseUrl": "https://pub.dev/"
    }
    ```

## Contributing

Contributions are welcome! Whether it's bug reports, feature requests, or pull requests, please feel free to participate.

**Development Setup:**

1.  **Prerequisites:** [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) (or npm).
2.  **Clone:** `git clone https://github.com/danieljbk/flutter-links.git`
3.  **Install Dependencies:** `cd flutter-links && yarn install` (or `npm install`)
4.  **Compile:** `yarn run compile` (or `npm run compile`)
5.  **Run in Debug Mode:** Open the project in VS Code and press `F5`. This will open a new Extension Development Host window with the extension loaded.
6.  **Make Changes:** Edit code in the `src/` directory. Run `yarn run watch` to automatically recompile on changes. You may need to reload the Extension Development Host window (`Developer: Reload Window` command) to see changes take effect.

**Submitting Issues:** Please use the [GitHub Issues](https://github.com/danieljbk/flutter-links/issues) tab. Provide clear steps to reproduce, expected behavior, and actual behavior.

**Pull Requests:**
*   Please fork the repository and create a new branch for your feature or bug fix.
*   Ensure code compiles (`yarn run compile`).
*   (Optional but Recommended) Add ESLint/Prettier and ensure code adheres to linting/formatting rules before submitting.
*   Submit the PR with a clear description of the changes.

## Publishing (For Maintainers)

1.  Install the VS Code Extension manager tool: `npm install -g @vscode/vsce` or `yarn global add @vscode/vsce`.
2.  Login to the publisher account (if not already done): `vsce login djbkwon`.
3.  Update the `version` in `package.json` and create a `CHANGELOG.md` entry.
4.  Package the extension: `vsce package`. This creates a `.vsix` file.
5.  Publish: `vsce publish` (or `vsce publish minor`/`patch` to auto-increment the version).

## Credits

*   Original concept and initial code by [Everettjf](https://github.com/everettjf).
*   Current development by [Joonbeom (Daniel) Kwon](https://github.com/danieljbk).
*   Icon design inspired by resources from [Freepik](https://www.flaticon.com/authors/freepik).

## License

[MIT](./LICENSE.txt)