import * as vscode from 'vscode';
import { getSelectedCode } from '../utils/getSelectedCode';
import { detectLanguage } from '../utils/languageDetector';
import { Providers } from '../providers';
import { saveHistoryEntry } from '../panels/historyPanel';
import { escapeHtml } from '../utils/escapeHtml';


export async function debugSuggestionsCommand(context: vscode.ExtensionContext) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }


    const code = getSelectedCode(editor);
    if (!code) {
        vscode.window.showErrorMessage('Please select a code snippet to analyze for debug suggestions.');
        return;
    }


    const language = detectLanguage(editor.document.fileName, editor.document.languageId);
    const prompt = `You are a senior ${language} engineer. For the code below, suggest minimal, non-invasive debugging steps, logs, and checkpoints that would help diagnose runtime issues. Explain what to log and why:\n\n${code}`;


    const provider = Providers.getDefault(context);
    const result = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'DevAugment: Suggesting debug steps...' }, async () => {
        try {
            const out = await provider.generate({ model: provider.defaultModel, prompt, temperature: 0.2, maxTokens: 400 });
            return out;
        } catch (err: any) {
            vscode.window.showErrorMessage('Provider error: ' + (err.message ?? String(err)));
            return null;
        }
    });


    if (result) {
        const panel = vscode.window.createWebviewPanel('devaugment.debug', 'DevAugment — Debug Suggestions', vscode.ViewColumn.Beside, {});
        panel.webview.html = `<!doctype html><html><body><pre>${escapeHtml(result)}</pre></body></html>`;
        saveHistoryEntry(context, { feature: 'debug', codePreview: code.slice(0, 400), result: result });
    }
}
