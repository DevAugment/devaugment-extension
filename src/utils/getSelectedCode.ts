import * as vscode from "vscode";

export function getSelectedCode(editor: vscode.TextEditor): string {
    const selection = editor.selection;

    if (selection.isEmpty) {
        return editor.document.getText();
    }

    return editor.document.getText(selection).trim();
}
