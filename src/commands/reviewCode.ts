import * as vscode from 'vscode';
import { getSelectedCode } from '../utils/getSelectedCode';
import { detectLanguage } from '../utils/languageDetector';
import { Providers } from '../providers';
import { saveHistoryEntry } from '../panels/historyPanel';
import { escapeHtml } from '../utils/escapeHtml';


export async function reviewCodeCommand(context: vscode.ExtensionContext) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }


    const code = getSelectedCode(editor);
    if (!code) {
        vscode.window.showErrorMessage('Please select a code snippet to review.');
        return;
    }


    const language = detectLanguage(editor.document.fileName, editor.document.languageId);


    const prompt = `You are a senior ${language} developer. Review the following code and provide concise, actionable feedback:\n\n${code}`;


    const provider = Providers.getDefault(context);
    const result = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'DevAugment: Reviewing code...' }, async () => {
        try {
            const out = await provider.generate({ model: provider.defaultModel, prompt, temperature: 0, maxTokens: 800 });
            return out;
        } catch (err: any) {
            vscode.window.showErrorMessage('Provider error: ' + (err.message ?? String(err)));
            return null;
        }
    });


    if (result) {
        // show result in a webview
        const panel = vscode.window.createWebviewPanel('devaugment.review', 'DevAugment — Code Review', vscode.ViewColumn.Beside, {});
        panel.webview.html = `<!doctype html><html><body><pre>${escapeHtml(result)}</pre></body></html>`;


        // save to history
        saveHistoryEntry(context, { feature: 'review', codePreview: code.slice(0, 400), result: result });
    }
}