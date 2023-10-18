import * as vscode from 'vscode';
import { newOperationSnippet } from '../snippets';

async function newOperation() {

    const editor = vscode.window.activeTextEditor;
    const lastIndex = editor?.document.lineCount;
 
    if (lastIndex) {
        await editor?.insertSnippet(newOperationSnippet, new vscode.Position(lastIndex - 1, 0));
        vscode.commands.executeCommand('editor.action.formatDocument');
    }
}



export { newOperation };