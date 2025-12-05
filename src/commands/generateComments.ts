import * as vscode from 'vscode';
import { getSelectedCode } from '../utils/getSelectedCode';
import { detectLanguage } from '../utils/languageDetector';
import { Providers } from '../providers';
import { saveHistoryEntry } from '../panels/historyPanel';
import { escapeHtml } from '../utils/escapeHtml';


export async function generateCommentsCommand(context: vscode.ExtensionContext) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }


    const code = getSelectedCode(editor);
    if (!code) {
        vscode.window.showErrorMessage('Please select a code snippet to generate comments for.');
        return;
    }


    const language = detectLanguage(editor.document.fileName, editor.document.languageId);


    const prompt = `You are an experienced ${language} developer. Generate an idiomatic docstring or comment block for the following code:\n\n${code}`;


    const provider = Providers.getDefault(context);
    const result = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'DevAugment: Generating comments...' }, async () => {
        try {
            const out = await provider.generate({ model: provider.defaultModel, prompt, temperature: 0.2, maxTokens: 400 });
            return out;
        } catch (err: any) {
            vscode.window.showErrorMessage('Provider error: ' + (err.message ?? String(err)));
            return null;
        }
    });


    if (result) {
        // show quick pick: preview or insert
        const action = await vscode.window.showQuickPick(['Preview', 'Insert above selection', 'Cancel'], { placeHolder: 'Choose action' });
        if (action === 'Preview') {
            const panel = vscode.window.createWebviewPanel('devaugment.commentsPreview', 'DevAugment — Comment Preview', vscode.ViewColumn.Beside, {});
            panel.webview.html = `<!doctype html><html><body><pre>${escapeHtml(result)}</pre></body></html>`;
        } else if (action === 'Insert above selection') {
            const edit = new vscode.WorkspaceEdit();
            const sel = editor.selection;
            edit.insert(editor.document.uri, sel.start, result + '\n');
            await vscode.workspace.applyEdit(edit);
            await editor.document.save();
        }


        saveHistoryEntry(context, { feature: 'generate_comments', codePreview: code.slice(0, 400), result: result });
    }
}
