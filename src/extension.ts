import * as vscode from 'vscode';
import { reviewCodeCommand } from './commands/reviewCode';
import { generateCommentsCommand } from './commands/generateComments';
import { debugSuggestionsCommand } from './commands/debugSuggestions';

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
}

export function deactivate() {
    console.log('DevAugment extension deactivated');
}