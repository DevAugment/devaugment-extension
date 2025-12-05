import * as vscode from 'vscode';
import { reviewCodeCommand } from './commands/reviewCode';
import { generateCommentsCommand } from './commands/generateComments';
import { debugSuggestionsCommand } from './commands/debugSuggestions';
import { setApiKeyCommand } from './commands/setApiKey';
import { DevAugmentSettingsPanel } from './panels/settingsPanel';

export async function activate(context: vscode.ExtensionContext) {
    console.log('DevAugment extension activated');


    context.subscriptions.push(
        vscode.commands.registerCommand('devaugment.reviewCode', async () => {
            await reviewCodeCommand(context);
        })
    );


    context.subscriptions.push(
        vscode.commands.registerCommand('devaugment.generateComments', async () => {
            await generateCommentsCommand(context);
        })
    );


    context.subscriptions.push(
        vscode.commands.registerCommand('devaugment.debugSuggestions', async () => {
            await debugSuggestionsCommand(context);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("devaugment.setApiKey", () => setApiKeyCommand(context))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("devaugment.openSettings", () => {
            DevAugmentSettingsPanel.open(context);
        })
    );

    // Status Bar Item
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = "devaugment.openSettings";

    function updateStatusBar() {
        const provider = vscode.workspace.getConfiguration("devaugment").get("provider", "openai");
        statusBar.text = `DevAugment: $(rocket) ${provider}`;
        statusBar.show();
    }

    updateStatusBar();

    // Update when settings change
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration("devaugment.provider")) {
                updateStatusBar();
            }
        })
    );

    context.subscriptions.push(statusBar);
}

export function deactivate() {
    console.log('DevAugment extension deactivated');
}