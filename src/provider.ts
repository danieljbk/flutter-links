// src/provider.ts

/**
 * Provides CodeLenses for pubspec.yaml files, showing links to pub.dev.
 * Also handles enabling/disabling based on workspace state.
 */

import * as vscode from 'vscode'
import { TOGGLE_STATE_KEY, CMD_VIEW_DEPENDENCY_PARAM } from './constants' // Import shared constants

/**
 * Implements the CodeLensProvider interface for Flutter dependency links.
 */
export class PubspecCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>()
  public readonly onDidChangeCodeLenses: vscode.Event<void> =
    this._onDidChangeCodeLenses.event

  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context

    // Optional: Listen for configuration changes if the provider itself needs
    // to adapt its behavior based on settings other than just the base URL.
    // vscode.workspace.onDidChangeConfiguration(_ => {
    //    this._onDidChangeCodeLenses.fire();
    // });
  }

  /**
   * Triggers a refresh of the CodeLenses. Called from extension.ts when state changes.
   */
  public triggerRefresh(): void {
    this._onDidChangeCodeLenses.fire()
  }

  /**
   * Computes and returns CodeLenses for the given document.
   * @param document The text document to analyze.
   * @param token A cancellation token.
   * @returns A list of CodeLens objects or null.
   */
  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    // 1. Check Enablement State
    // Retrieve the current toggle state from workspace storage.
    const isEnabled = this.context.workspaceState.get<boolean>(
      TOGGLE_STATE_KEY,
      true
    )
    if (!isEnabled) {
      // If disabled, return an empty array immediately.
      return []
    }

    // 2. Basic Document Check (optional, selector in extension.ts is primary)
    // Although the registration uses a selector, an extra check doesn't hurt.
    if (
      document.languageId !== 'yaml' ||
      !document.fileName.endsWith('pubspec.yaml')
    ) {
      return []
    }

    console.log(
      `[Flutter Links Provider] Providing lenses for: ${document.fileName}`
    )

    // 3. Parse Document Lines for Dependencies
    const codeLenses: vscode.CodeLens[] = []
    let inDependencyScope = false // Tracks if currently inside a relevant dependency section
    let currentScopeIndent = -1 // Indentation level of the current scope key (e.g., 'dependencies:')

    for (let i = 0; i < document.lineCount; i++) {
      // Check for cancellation request periodically
      if (token.isCancellationRequested) {
        console.log('[Flutter Links Provider] Cancellation requested.')
        return []
      }

      const line = document.lineAt(i)
      const text = line.text
      const trimmedText = text.trim()

      // Ignore empty lines and comments
      if (trimmedText.length === 0 || trimmedText.startsWith('#')) {
        continue
      }

      const lineIndent = line.firstNonWhitespaceCharacterIndex

      // Check for top-level dependency scope keys
      if (lineIndent === 0) {
        if (
          trimmedText === 'dependencies:' ||
          trimmedText === 'dev_dependencies:' ||
          trimmedText === 'dependency_overrides:'
        ) {
          inDependencyScope = true
          currentScopeIndent = lineIndent // Should be 0
          console.log(`[Flutter Links Provider] Entered scope: ${trimmedText}`)
        } else {
          // Any other top-level key resets the scope
          if (inDependencyScope) {
            console.log(
              `[Flutter Links Provider] Exited scope due to non-indented line: ${trimmedText}`
            )
          }
          inDependencyScope = false
          currentScopeIndent = -1
        }
        continue // Move to the next line after processing scope keys
      }

      // Process lines within an active dependency scope
      if (inDependencyScope && lineIndent > currentScopeIndent) {
        // This is a potential dependency line.
        // Basic check: must contain a colon and not be just whitespace.
        // More robust parsing would use a YAML library.
        if (trimmedText.includes(':')) {
          // Attempt to extract package name (key before the colon)
          const match = trimmedText.match(/^([a-zA-Z0-9_]+)\s*:/)
          if (match && match[1]) {
            const packageName = match[1]
            const range = line.range // Range for the entire line

            // Create the command that will be executed when the CodeLens is clicked
            const command: vscode.Command = {
              title: `🔗 pub.dev/packages/${packageName}`, // Text displayed for the CodeLens
              tooltip: `Open ${packageName} on pub.dev`, // Hover text
              command: CMD_VIEW_DEPENDENCY_PARAM, // Command ID to execute
              arguments: [packageName], // Arguments passed to the command
            }

            // Add the new CodeLens to our list
            codeLenses.push(new vscode.CodeLens(range, command))
          }
        }
        // We don't handle nested maps under dependencies here (like git:, path:, sdk:)
        // This simple parser only creates links for direct key: value pairs.
      }
    }

    console.log(
      `[Flutter Links Provider] Found ${codeLenses.length} potential dependencies.`
    )
    return codeLenses
  }

  // Optional: resolveCodeLens if you need to perform heavy computations
  // only when a CodeLens becomes visible. For simple links, it's usually not needed.
  // public resolveCodeLens?(
  //   codeLens: vscode.CodeLens,
  //   token: vscode.CancellationToken
  // ): vscode.ProviderResult<vscode.CodeLens> {
  //   // Example: Fetch latest version here if needed
  //   // Ensure to check isEnabled state again if doing work here
  //   // const isEnabled = this.context.workspaceState.get<boolean>(TOGGLE_STATE_KEY, true);
  //   // if (!isEnabled) return null;
  //   return codeLens;
  // }
}
