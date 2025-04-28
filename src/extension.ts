import * as vscode from 'vscode'
import { PubspecCodeLensProvider } from './provider' // Use named import

// Key for storing the toggle state in workspace settings
const TOGGLE_STATE_KEY = 'flutterLinks.enabled'

// Helper to get the base URL from configuration
function getBaseUrl(): string {
  // Use the renamed configuration key
  return vscode.workspace
    .getConfiguration('flutterLinks')
    .get<string>('baseUrl', 'https://pub.dev/')
}

// Original function to open URL
function openPackageUrl(packageName: string) {
  const baseUrl = getBaseUrl()
  const packageUrl = baseUrl + 'packages/' + encodeURI(packageName)
  vscode.env.openExternal(vscode.Uri.parse(packageUrl))
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Flutter Links activated')

  // --- State Management ---
  // Get initial state (default to true/enabled)
  let isEnabled = context.workspaceState.get<boolean>(TOGGLE_STATE_KEY, true)

  // --- CodeLens Provider ---
  // Create ONE instance of the provider
  const codeLensProvider = new PubspecCodeLensProvider(context) // Pass context

  // Register the provider
  // Use a more specific document selector
  const docSelector: vscode.DocumentSelector = {
    language: 'yaml',
    scheme: 'file',
    pattern: '**/pubspec.yaml', // Match pubspec.yaml anywhere in the workspace
  }
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    docSelector,
    codeLensProvider
  )
  context.subscriptions.push(codeLensProviderDisposable)

  // --- Toggle Command ---
  const toggleCommandDisposable = vscode.commands.registerCommand(
    'flutterLinks.toggle',
    () => {
      // Flip the state
      isEnabled = !isEnabled
      // Store the new state persistently for this workspace
      context.workspaceState.update(TOGGLE_STATE_KEY, isEnabled)

      // Trigger a refresh of the CodeLenses
      codeLensProvider.triggerRefresh()

      // Notify the user
      vscode.window.showInformationMessage(
        `Flutter Links: ${isEnabled ? 'Enabled' : 'Disabled'}`
      )
    }
  )
  context.subscriptions.push(toggleCommandDisposable)

  // --- Existing Commands (register them) ---
  const commandSearchDisposable = vscode.commands.registerTextEditorCommand(
    'extension.viewDependencyWithParameter',
    (
      textEditor: vscode.TextEditor,
      edit: vscode.TextEditorEdit,
      packageName: string
    ) => {
      if (packageName) {
        openPackageUrl(packageName)
      }
    }
  )
  context.subscriptions.push(commandSearchDisposable)

  const commandInputDisposable = vscode.commands.registerCommand(
    'extension.viewDependency',
    () => {
      vscode.window
        .showInputBox({
          prompt: 'Enter Flutter package name to view on pub.dev',
        })
        .then((text) => {
          if (text) {
            // Check for non-empty string
            console.log('Input: ' + text)
            openPackageUrl(text)
          } else {
            console.log('No input provided.')
          }
        })
    }
  )
  context.subscriptions.push(commandInputDisposable)

  // Optional: Update configuration reading if needed elsewhere
  // Example: Listen for config changes if base URL affects other things
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('flutterLinks.baseUrl')) {
        // If base URL change should also refresh lenses, do it here
        codeLensProvider.triggerRefresh()
        console.log('Flutter Links base URL changed, refreshing lenses.')
      }
    })
  )
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('Flutter Links deactivated')
}
