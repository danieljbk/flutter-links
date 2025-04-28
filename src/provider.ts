import * as vscode from 'vscode'

// --- NEW: Import the toggle state key ---
// If extension.ts and provider.ts are separate modules,
// you might need to export/import this constant or pass it differently.
// For simplicity here, we redeclare it, but sharing is better.
const TOGGLE_STATE_KEY = 'flutterLinks.enabled'

// Helper functions (keep as they are)
function getLeftSpaceWidth(text: string): number {
  // ... (your existing logic)
  let width = 0
  for (let i = 0; i < text.length; i += 1) {
    if (text.charAt(i) === ' ') {
      width += 1
    } else {
      break
    }
  }
  return width
}

function readDocumentLines(document: vscode.TextDocument): vscode.TextLine[] {
  // Ensure we only process pubspec.yaml
  // The selector in extension.ts helps, but double-check is safe.
  if (!document.fileName.endsWith('pubspec.yaml')) {
    console.log('Provider skipping non-pubspec file:', document.fileName)
    return []
  }
  console.log('Provider processing:', document.fileName)

  // ... (your existing parsing logic) ...
  let inDependencyScope = false
  let lastItemOK = false
  let lastItemLeftSpaceWidth = 0

  return new Array(document.lineCount)
    .fill('')
    .map((line, idx) => document.lineAt(idx))
    .filter((line) => {
      const { text } = line

      // ignore empty line
      if (text.trim().length === 0) {
        return false
      }

      // at least one space
      if (text.startsWith(' ') && inDependencyScope) {
        if (!text.includes(':')) {
          // console.log('failed no: =', text) // Reduce noise
          return false
        }

        if (lastItemOK) {
          let currentWidth = getLeftSpaceWidth(text)
          if (currentWidth > lastItemLeftSpaceWidth) {
            // child item, ignore
            return false
          }
        }

        lastItemOK = true
        lastItemLeftSpaceWidth = getLeftSpaceWidth(text)
        return true
      }

      // detect dependency scope
      if (text.startsWith('dependencies:') && text.trim() === 'dependencies:') {
        inDependencyScope = true
      } else if (
        text.startsWith('dev_dependencies:') &&
        text.trim() === 'dev_dependencies:'
      ) {
        inDependencyScope = true
      } else if (
        text.startsWith('dependency_overrides:') && // Handle overrides too
        text.trim() === 'dependency_overrides:'
      ) {
        inDependencyScope = true
      } else if (!text.startsWith(' ')) {
        // Any non-indented line resets scope
        inDependencyScope = false
      }
      lastItemOK = false
      return false
    })
}

// --- Modified Provider Class ---
export class PubspecCodeLensProvider implements vscode.CodeLensProvider {
  // --- Event Emitter for Refreshing ---
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>()
  public readonly onDidChangeCodeLenses: vscode.Event<void> =
    this._onDidChangeCodeLenses.event

  // --- Store Context ---
  private context: vscode.ExtensionContext

  // --- Constructor to Accept Context ---
  constructor(context: vscode.ExtensionContext) {
    this.context = context

    // Optional: Could listen for workspace state changes here too,
    // but the command pattern triggering refresh is usually sufficient.
  }

  // --- Method to Trigger Refresh ---
  public triggerRefresh(): void {
    console.log('FlutterLinks Provider: Refresh triggered')
    this._onDidChangeCodeLenses.fire()
  }

  // --- Provide CodeLenses Implementation ---
  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    // --- Check Toggle State ---
    const isEnabled = this.context.workspaceState.get<boolean>(
      TOGGLE_STATE_KEY,
      true
    )
    if (!isEnabled) {
      console.log('FlutterLinks Provider: Disabled, returning no lenses.')
      return [] // Return empty array if disabled
    }

    // --- Proceed if Enabled ---
    console.log('FlutterLinks Provider: Enabled, providing lenses.')
    const lines = readDocumentLines(document) // Use your parsing logic

    if (token.isCancellationRequested) {
      console.log('FlutterLinks Provider: Cancellation requested.')
      return []
    }

    return lines
      .map((line) => {
        const packageNameMatch = line.text.match(/^\s*([a-zA-Z0-9_]+)\s*:/)
        if (!packageNameMatch || !packageNameMatch[1]) {
          return null // Should not happen if readDocumentLines is correct, but safe check
        }
        const packageName = packageNameMatch[1]

        const range = line.range // Use the whole line range for the CodeLens position
        const command: vscode.Command = {
          title: `🔗 pub.dev/packages/${packageName}`, // Add emoji for visibility?
          tooltip: `Open ${packageName} on pub.dev`,
          command: 'extension.viewDependencyWithParameter', // Your existing command
          arguments: [packageName],
        }
        return new vscode.CodeLens(range, command)
      })
      .filter((lens) => lens !== null) as vscode.CodeLens[] // Filter out any nulls
  }

  // Optional: resolveCodeLens if needed for performance
  // resolveCodeLens?(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
  //     // If you move heavy logic here (like fetching latest version), check isEnabled again
  //     const isEnabled = this.context.workspaceState.get<boolean>(TOGGLE_STATE_KEY, true);
  //     if (!isEnabled) {
  //         // Technically shouldn't be called if provideCodeLenses returns [], but be safe
  //         return null;
  //     }
  //     // ... resolve logic ...
  // 	return codeLens;
  // }
}
