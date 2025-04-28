// src/extension.ts

/**
 * Main activation point for the Flutter Links extension.
 * Handles command registration, state management, context setting,
 * and CodeLens provider activation.
 */

import * as vscode from 'vscode'
import { PubspecCodeLensProvider } from './provider'
import {
  TOGGLE_STATE_KEY,
  CONTEXT_KEY_ENABLED,
  CMD_SHOW_LINKS,
  CMD_HIDE_LINKS,
  CMD_VIEW_DEPENDENCY_INPUT,
  CMD_VIEW_DEPENDENCY_PARAM,
  CONFIG_BASE_URL,
} from './constants' // Import shared constants

// --- Helper Functions ---

/**
 * Gets the base URL for package links from configuration.
 * @returns The configured base URL or the default pub.dev URL.
 */
function getBaseUrl(): string {
  // Read configuration using the constant key
  return vscode.workspace
    .getConfiguration('flutterLinks') // Section name matches package.json
    .get<string>(CONFIG_BASE_URL.split('.')[1], 'https://pub.dev/') // Get specific key, provide default
}

/**
 * Opens the package URL in the default external browser.
 * @param packageName The name of the package to open.
 */
function openPackageUrl(packageName: string): void {
  if (!packageName) return // Basic guard clause

  try {
    const baseUrl = getBaseUrl()
    const packageUrl = baseUrl + 'packages/' + encodeURI(packageName)
    vscode.env.openExternal(vscode.Uri.parse(packageUrl))
  } catch (error) {
    console.error(
      `[Flutter Links] Error constructing or opening URL for ${packageName}:`,
      error
    )
    vscode.window.showErrorMessage(
      `Failed to open link for package: ${packageName}`
    )
  }
}

/**
 * Shows a timed notification in the bottom-right corner using the Progress API.
 * This workarounds the lack of a built-in timeout for showInformationMessage.
 *
 * @param message The text message to display.
 * @param durationMs The duration in milliseconds (default: 3000).
 */
function showTimedNotification(
  message: string,
  durationMs: number = 3000
): void {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: message,
      cancellable: false,
    },
    (progress, token) => {
      // Animate progress to make the timeout less abrupt visually
      const totalSteps = 30
      const increment = 100 / totalSteps
      const intervalDuration = durationMs / totalSteps
      let currentStep = 0

      // Report initial state so bar appears
      progress.report({ increment: 0 })

      return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (currentStep < totalSteps) {
            progress.report({ increment: increment })
            currentStep++
          } else {
            // Fallback clear if somehow step count exceeded before timeout
            clearInterval(interval)
            resolve()
          }
        }, intervalDuration)

        // Ensure cleanup and resolution after the main duration
        setTimeout(() => {
          clearInterval(interval)
          resolve() // Resolving the promise hides the notification
        }, durationMs)
      })
    }
  )
}

// --- Extension Lifecycle ---

/**
 * Called when the extension is activated.
 * Sets up commands, state, providers, and listeners.
 * @param context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('[Flutter Links] Activated')

  // --- State & Context Initialization ---
  const isEnabled = context.workspaceState.get<boolean>(TOGGLE_STATE_KEY, true)
  vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, isEnabled)
  console.log(
    `[Flutter Links] Initial state: ${isEnabled ? 'Enabled' : 'Disabled'}`
  )

  // --- CodeLens Provider ---
  const codeLensProvider = new PubspecCodeLensProvider(context)
  const docSelector: vscode.DocumentSelector = {
    // Using language id is generally more reliable than file extension
    language: 'yaml',
    scheme: 'file',
    // Pattern ensures we only target files named pubspec.yaml
    pattern: '**/pubspec.yaml',
  }
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    docSelector,
    codeLensProvider
  )
  context.subscriptions.push(codeLensProviderDisposable)
  console.log('[Flutter Links] CodeLens provider registered for pubspec.yaml')

  // --- Command Registrations ---

  // Show Links Command
  const showCommandDisposable = vscode.commands.registerCommand(
    CMD_SHOW_LINKS,
    () => {
      if (context.workspaceState.get<boolean>(TOGGLE_STATE_KEY) === true) return

      console.log(`[Flutter Links] Executing command: ${CMD_SHOW_LINKS}`)
      context.workspaceState.update(TOGGLE_STATE_KEY, true)
      vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, true)
      codeLensProvider.triggerRefresh()
      showTimedNotification('Flutter Links: Enabled')
    }
  )
  context.subscriptions.push(showCommandDisposable)

  // Hide Links Command
  const hideCommandDisposable = vscode.commands.registerCommand(
    CMD_HIDE_LINKS,
    () => {
      if (context.workspaceState.get<boolean>(TOGGLE_STATE_KEY) === false)
        return

      console.log(`[Flutter Links] Executing command: ${CMD_HIDE_LINKS}`)
      context.workspaceState.update(TOGGLE_STATE_KEY, false)
      vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, false)
      codeLensProvider.triggerRefresh()
      showTimedNotification('Flutter Links: Disabled')
    }
  )
  context.subscriptions.push(hideCommandDisposable)

  // View Dependency (from CodeLens) Command
  const viewParamCommandDisposable = vscode.commands.registerTextEditorCommand(
    CMD_VIEW_DEPENDENCY_PARAM,
    (
      textEditor: vscode.TextEditor,
      edit: vscode.TextEditorEdit,
      packageName?: string
    ) => {
      if (packageName) {
        console.log(
          `[Flutter Links] Executing command: ${CMD_VIEW_DEPENDENCY_PARAM} for ${packageName}`
        )
        openPackageUrl(packageName)
      } else {
        console.warn(
          `[Flutter Links] ${CMD_VIEW_DEPENDENCY_PARAM} called without package name.`
        )
      }
    }
  )
  context.subscriptions.push(viewParamCommandDisposable)

  // View Dependency (from Input) Command
  const viewInputCommandDisposable = vscode.commands.registerCommand(
    CMD_VIEW_DEPENDENCY_INPUT,
    async () => {
      // Use async/await for cleaner promise handling
      console.log(
        `[Flutter Links] Executing command: ${CMD_VIEW_DEPENDENCY_INPUT}`
      )
      const packageName = await vscode.window.showInputBox({
        prompt: 'Enter Flutter package name to view on pub.dev',
        placeHolder: 'e.g., provider',
        ignoreFocusOut: true, // Keep input box open if user clicks elsewhere
      })

      if (packageName) {
        console.log(`[Flutter Links] Input received: ${packageName}`)
        openPackageUrl(packageName)
      } else {
        console.log('[Flutter Links] No input provided.')
        // Optionally show a message if desired:
        // vscode.window.showInformationMessage('No package name entered.');
      }
    }
  )
  context.subscriptions.push(viewInputCommandDisposable)

  // --- Configuration Listener ---
  const configListenerDisposable = vscode.workspace.onDidChangeConfiguration(
    (e) => {
      // Check if the specific configuration key that affects us has changed
      if (e.affectsConfiguration(CONFIG_BASE_URL)) {
        console.log(
          '[Flutter Links] Base URL configuration changed, refreshing lenses.'
        )
        // No need to re-read config here, getBaseUrl() reads it on demand.
        // Just trigger a refresh so new links (if any) use the new base.
        codeLensProvider.triggerRefresh()
      }
    }
  )
  context.subscriptions.push(configListenerDisposable)
}

/**
 * Called when the extension is deactivated.
 * Cleans up resources, like context keys.
 */
export function deactivate(): void {
  // Clean up context state
  vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, undefined)
  console.log('[Flutter Links] Deactivated')
}
