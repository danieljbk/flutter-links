// extension.ts
import * as vscode from 'vscode'
import { PubspecCodeLensProvider } from './provider'

const TOGGLE_STATE_KEY = 'flutterLinks.enabled'
const CONTEXT_KEY_ENABLED = 'flutterLinks:enabled' // Context key remains the same

// Helper functions (getBaseUrl, openPackageUrl) remain the same...
function getBaseUrl(): string {
  return vscode.workspace
    .getConfiguration('flutterLinks')
    .get<string>('baseUrl', 'https://pub.dev/')
}

function openPackageUrl(packageName: string) {
  const baseUrl = getBaseUrl()
  const packageUrl = baseUrl + 'packages/' + encodeURI(packageName)
  vscode.env.openExternal(vscode.Uri.parse(packageUrl))
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Flutter Links activated')

  // --- State Management ---
  // Initial state read remains the same
  let isEnabled = context.workspaceState.get<boolean>(TOGGLE_STATE_KEY, true)
  vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, isEnabled)

  // --- CodeLens Provider ---
  // Instantiation and registration remain the same
  const codeLensProvider = new PubspecCodeLensProvider(context)
  const docSelector: vscode.DocumentSelector = {
    language: 'yaml',
    scheme: 'file',
    pattern: '**/pubspec.yaml',
  }
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    docSelector,
    codeLensProvider
  )
  context.subscriptions.push(codeLensProviderDisposable)

  // --- NEW: Show Command ---
  const showCommandDisposable = vscode.commands.registerCommand(
    'flutterLinks.show',
    () => {
      // Check if already enabled to avoid unnecessary updates
      if (context.workspaceState.get<boolean>(TOGGLE_STATE_KEY) === true) {
        return
      }
      console.log('Executing flutterLinks.show')
      // Set state to true
      context.workspaceState.update(TOGGLE_STATE_KEY, true)
      // Update context key
      vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, true)
      // Refresh lenses
      codeLensProvider.triggerRefresh()
      // Optional notification
      // vscode.window.showInformationMessage('Flutter Links: Enabled');
    }
  )
  context.subscriptions.push(showCommandDisposable)

  // --- NEW: Hide Command ---
  const hideCommandDisposable = vscode.commands.registerCommand(
    'flutterLinks.hide',
    () => {
      // Check if already disabled to avoid unnecessary updates
      if (context.workspaceState.get<boolean>(TOGGLE_STATE_KEY) === false) {
        return
      }
      console.log('Executing flutterLinks.hide')
      // Set state to false
      context.workspaceState.update(TOGGLE_STATE_KEY, false)
      // Update context key
      vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, false)
      // Refresh lenses
      codeLensProvider.triggerRefresh()
      // Optional notification
      // vscode.window.showInformationMessage('Flutter Links: Disabled');
    }
  )
  context.subscriptions.push(hideCommandDisposable)

  // --- Existing Commands (viewDependency, viewDependencyWithParameter) remain the same ---
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
            console.log('Input: ' + text)
            openPackageUrl(text)
          } else {
            console.log('No input provided.')
          }
        })
    }
  )
  context.subscriptions.push(commandInputDisposable)

  // Config change listener remains the same
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('flutterLinks.baseUrl')) {
        codeLensProvider.triggerRefresh()
        console.log('Flutter Links base URL changed, refreshing lenses.')
      }
    })
  )
}

export function deactivate() {
  vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, undefined)
  console.log('Flutter Links deactivated')
}
