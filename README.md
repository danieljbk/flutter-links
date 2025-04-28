# Flutter Links: VSCode Extension

<p align="center">
  <img src="./img/icon.png" alt="Flutter Links Icon" width="128">
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=djbkwon.flutter-dependency-docs" target="_blank">
    <img src="https://img.shields.io/visual-studio-marketplace/v/djbkwon.flutter-dependency-docs?style=flat-square&label=Marketplace" alt="Marketplace Version"/>
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=djbkwon.flutter-dependency-docs" target="_blank">
    <img src="https://img.shields.io/visual-studio-marketplace/i/djbkwon.flutter-dependency-docs?style=flat-square&label=Installs" alt="Installs"/>
  </a>
  <a href="./LICENSE.txt" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"/>
  </a>
</p>


Effortlessly view your Flutter package dependencies on [pub.dev](https://pub.dev) directly within Visual Studio Code.

![Screenshot showing CodeLenses above dependencies and toggle button](./img/view-package.png)

## Features

### Major

*   **CodeLens Links:** Displays a clickable `pub.dev/packages/...` link directly above each dependency listed in your `pubspec.yaml` file (`dependencies`, `dev_dependencies`, `dependency_overrides`).
*   **Quick Toggle:** Easily show or hide the CodeLens links using a convenient toggle button in the editor's title bar when viewing `pubspec.yaml`.
*   **Lightweight:** Focused solely on providing dependency links without unnecessary overhead.

### Minor

*   **Manual Package Search:** Quickly search for *any* package on pub.dev via the Command Palette.
*   **Configurable Base URL:** Optionally change the base URL used for links via VS Code settings (useful for private package repositories that mimic the pub.dev API structure).


## Usage

1.  Install the "Flutter Links" extension from the VS Code Marketplace.
2.  Open a Flutter project containing a `pubspec.yaml` file.
3.  CodeLenses with links to `pub.dev` (or your configured base URL) will appear above the dependencies. Click a link to open the package page.
4.  Use the button in the editor's title bar (top-right) to toggle the visibility of these links.
5.  **Alternatively, search manually:** Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P), type "Flutter Links", select "Flutter Links: Search pub.dev Package", and enter the package name you want to find.

## Configuration

*   **`flutterLinks.baseUrl`**: (Optional) Set a custom base URL for the package links.
    *   **Default:** `"https://pub.dev/"`
    *   **Example:** `"https://my-private-repo.com/api/"` (Ensure your repo structure matches `/packages/<name>`)

    Configure this in your User or Workspace `settings.json` (Command Palette: `Preferences: Open Settings (JSON)`):
    ```json
    {
      "flutterLinks.baseUrl": "https://pub.dev/"
    }
    ```

## Contributing

Contributions are welcome! If you find a bug or have a feature suggestion, please use the GitHub Issues tab. If you'd like to contribute code, please feel free to submit a pull request.

**Development Setup:**

1.  **Prerequisites:** [Node.js](https://nodejs.org/) (LTS recommended) and [Yarn](https://yarnpkg.com/) (Classic or Berry) or npm.
2.  **Clone Repository:** `git clone https://github.com/danieljbk/flutter-links.git`
3.  **Install Dependencies:** `cd flutter-links && yarn install` (or `npm install`)
4.  **Compile:** `yarn run compile` (or `npm run compile`)
5.  **Run in Debug Mode:** Open the project folder in VS Code and press `F5`. This launches a new "Extension Development Host" window with your extension loaded.
6.  **Make Changes:** Use `yarn run watch` in a separate terminal to automatically recompile TypeScript files as you save them. You may need to reload the Extension Development Host window (`Developer: Reload Window` command) to apply changes.

**Pull Requests:**
*   Fork the repository and create a feature or bugfix branch.
*   Make your changes. Ensure the code compiles successfully (`yarn run compile`).
*   Submit the pull request with a clear description of the changes and why they are needed.

## Credits

*   Original concept and initial code by [Everettjf](https://github.com/everettjf).
*   Current development by [Joonbeom (Daniel) Kwon](https://github.com/danieljbk).

## License

[MIT](./LICENSE.txt) - See the `LICENSE.txt` file for details.