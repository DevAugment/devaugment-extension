import * as vscode from 'vscode';

export interface HistoryEntry {
    timestamp: number;
    feature: string;
    codePreview: string;
    result: string;
}

export class DevAugmentHistoryViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'devaugmentHistory';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly storage: vscode.Memento
    ) { }

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHtml(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (msg) => {
            if (msg.command === "rerun" && msg.feature) {
                vscode.commands.executeCommand(msg.feature);
            }
        });
    }

    private getHtml(webview: vscode.Webview) {
        const entries: HistoryEntry[] = this.storage.get("devaugment.history") || [];

        const items = entries.map(entry => `
      <li style="margin-bottom: 12px;">
        <strong>${new Date(entry.timestamp).toLocaleString()}</strong><br/>
        Feature: ${entry.feature}<br/>
        <pre style="background:#1e1e1e;padding:8px;border-radius:4px;white-space:pre-wrap;">${escape(entry.codePreview)}</pre>
        <button onclick="rerun('${entry.feature}')">Re-run</button>
      </li>
    `).join("");

        return `
    <!DOCTYPE html>
    <html>
    <body>
      <h2>DevAugment History</h2>
      <ul>${items}</ul>

      <script>
        const vscode = acquireVsCodeApi();
        function rerun(feature){
          vscode.postMessage({ command: "rerun", feature });
        }
      </script>
    </body>
    </html>`;
    }
}

export function saveHistoryEntry(context: vscode.ExtensionContext, entry: Omit<HistoryEntry, "timestamp">) {
    const prev: HistoryEntry[] = context.globalState.get("devaugment.history") || [];
    const updated = [{ timestamp: Date.now(), ...entry }, ...prev].slice(0, 20);
    context.globalState.update("devaugment.history", updated);
}

function escape(text: string) {
    return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
