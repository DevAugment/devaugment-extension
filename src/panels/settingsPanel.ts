import * as vscode from "vscode";

export class DevAugmentSettingsPanel {
    public static currentPanel: DevAugmentSettingsPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private readonly context: vscode.ExtensionContext;

    static open(context: vscode.ExtensionContext) {
        if (this.currentPanel) {
            this.currentPanel.panel.reveal();
            return;
        }
        this.currentPanel = new DevAugmentSettingsPanel(context);
    }

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;

        this.panel = vscode.window.createWebviewPanel(
            "devaugmentSettings",
            "DevAugment Settings",
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        this.panel.webview.html = this.getHtml();
        this.panel.webview.onDidReceiveMessage((msg) =>
            this.handleMessage(msg)
        );

        this.panel.onDidDispose(() => {
            DevAugmentSettingsPanel.currentPanel = undefined;
        });
    }

    private async handleMessage(msg: any) {
        switch (msg.command) {
            case "save":
                await this.saveSettings(msg.data);
                vscode.window.showInformationMessage("Settings updated!");
                break;
        }
    }

    private async saveSettings(data: any) {
        const config = vscode.workspace.getConfiguration("devaugment");

        await config.update("provider", data.provider, vscode.ConfigurationTarget.Global);

        if (data.apiKey) {
            const keyName =
                data.provider === "gemini"
                    ? "devaugment.gemini_api_key"
                    : "devaugment.openai_api_key";

            await this.context.secrets.store(keyName, data.apiKey);
        }
    }

    private getHtml() {
        const provider = vscode.workspace.getConfiguration("devaugment").get("provider") ?? "openai";

        return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; padding: 16px;">
        <h2>DevAugment Settings</h2>

        <label>Select Provider</label>
        <select id="provider">
          <option value="openai" ${provider === "openai" ? "selected" : ""}>OpenAI</option>
          <option value="gemini" ${provider === "gemini" ? "selected" : ""}>Gemini</option>
        </select>

        <br/><br/>

        <label>API Key</label>
        <input id="apiKey" type="password" style="width: 100%; padding: 8px;" placeholder="Enter API Key (optional)"/>

        <br/><br/>

        <button onclick="save()" style="padding: 8px 12px;">Save Settings</button>

        <script>
          const vscode = acquireVsCodeApi();
          
          function save() {
            const provider = document.getElementById("provider").value;
            const apiKey = document.getElementById("apiKey").value;

            vscode.postMessage({
              command: "save",
              data: { provider, apiKey }
            });
          }
        </script>
      </body>
      </html>
    `;
    }
}
