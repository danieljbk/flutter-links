// extension.ts (Complete File)

import * as vscode from 'vscode'
import { PubspecCodeLensProvider } from './provider'

const TOGGLE_STATE_KEY = 'flutterLinks.enabled'
const CONTEXT_KEY_ENABLED = 'flutterLinks:enabled' // Context key remains the same

// Helper function to get the base URL from configuration
function getBaseUrl(): string {
  return vscode.workspace
    .getConfiguration('flutterLinks')
    .get<string>('baseUrl', 'https://pub.dev/')
}

// Helper function to open the package URL
function openPackageUrl(packageName: string) {
  const baseUrl = getBaseUrl()
  const packageUrl = baseUrl + 'packages/' + encodeURI(packageName)
  vscode.env.openExternal(vscode.Uri.parse(packageUrl))
}

// --- Function to show timed notification with PROGRESS ANIMATION ---
function showTimedNotification(message: string, durationMs: number = 3000) {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: message,
      cancellable: false,
    },
    (progress, token) => {
      // --- Animate Progress ---
      const totalSteps = 30 // Number of updates over the duration
      const increment = 100 / totalSteps // Percentage increment per step
      const intervalDuration = durationMs / totalSteps // How often to update (ms)

      let currentStep = 0
      // Report initial progress slightly so the bar appears immediately
      progress.report({ increment: 0 })

      return new Promise<void>((resolve) => {
        // Start interval timer to report progress
        const interval = setInterval(() => {
          if (currentStep < totalSteps) {
            progress.report({ increment: increment })
            currentStep++
          } else {
            // Should technically not be reached if interval is cleared properly, but safety first
            clearInterval(interval)
            resolve()
          }
        }, intervalDuration)

        // Set a timeout to ensure completion and cleanup after the total duration
        setTimeout(() => {
          clearInterval(interval) // Stop the interval updates
          resolve() // Complete the progress, hiding the notification
        }, durationMs)
      })
      // --- End Animate Progress ---
    }
  )
}

// --- Main Activation Function ---
export function activate(context: vscode.ExtensionContext) {
  console.log('Flutter Links activated')

  // --- State Management ---
  // Read initial state and set the context key
  let isEnabled = context.workspaceState.get<boolean>(TOGGLE_STATE_KEY, true)
  vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, isEnabled)

  // --- CodeLens Provider Setup ---
  // Create and register the provider instance
  const codeLensProvider = new PubspecCodeLensProvider(context)
  const docSelector: vscode.DocumentSelector = {
    language: 'yaml',
    scheme: 'file',
    pattern: '**/pubspec.yaml', // Target only pubspec.yaml files
  }
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    docSelector,
    codeLensProvider
  )
  context.subscriptions.push(codeLensProviderDisposable)

  // --- Command Registrations ---

  // Show Links Command
  const showCommandDisposable = vscode.commands.registerCommand(
    'flutterLinks.show',
    () => {
      // Avoid redundant execution if already enabled
      if (context.workspaceState.get<boolean>(TOGGLE_STATE_KEY) === true) {
        return
      }
      console.log('Executing flutterLinks.show')
      // Update state and context
      context.workspaceState.update(TOGGLE_STATE_KEY, true)
      vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, true)
      // Refresh the CodeLenses in the editor
      codeLensProvider.triggerRefresh()
      // Show timed notification
      showTimedNotification('Flutter Links: Enabled', 3000)
    }
  )
  context.subscriptions.push(showCommandDisposable)

  // Hide Links Command
  const hideCommandDisposable = vscode.commands.registerCommand(
    'flutterLinks.hide',
    () => {
      // Avoid redundant execution if already disabled
      if (context.workspaceState.get<boolean>(TOGGLE_STATE_KEY) === false) {
        return
      }
      console.log('Executing flutterLinks.hide')
      // Update state and context
      context.workspaceState.update(TOGGLE_STATE_KEY, false)
      vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, false)
      // Refresh the CodeLenses in the editor
      codeLensProvider.triggerRefresh()
      // Show timed notification
      showTimedNotification('Flutter Links: Disabled', 3000)
    }
  )
  context.subscriptions.push(hideCommandDisposable)

  // Existing Command: Open URL from CodeLens parameter
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

  // Existing Command: Open URL from user input
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

  // --- Configuration Change Listener ---
  // Refresh lenses if the base URL configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('flutterLinks.baseUrl')) {
        codeLensProvider.triggerRefresh()
        console.log('Flutter Links base URL changed, refreshing lenses.')
      }
    })
  )
}

// --- Deactivation Function ---
export function deactivate() {
  // Clean up the context key when the extension is deactivated
  vscode.commands.executeCommand('setContext', CONTEXT_KEY_ENABLED, undefined)
  console.log('Flutter Links deactivated')
}
