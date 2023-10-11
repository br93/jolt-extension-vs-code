import * as vscode from 'vscode';
import path = require('path');

export class VSCodeActions {

    async openWindow(resourcesPath: string, transformation: string, firstFile: string, secondFile: string) {

        const firstWindow = await vscode.workspace.openTextDocument(path.join(resourcesPath, transformation, firstFile));
        vscode.window.showTextDocument(firstWindow, vscode.ViewColumn.Beside, false);

        const secondWindow = await vscode.workspace.openTextDocument(path.join(resourcesPath, transformation, secondFile));
        vscode.window.showTextDocument(secondWindow, vscode.ViewColumn.Beside, false);
    }

    async showOutput(content: string, language?: string) {

        const alreadyExists = this.editOutput(content);

        if (!alreadyExists) {
            const document = await vscode.workspace.openTextDocument({
                language,
                content,
            });

            vscode.window.showTextDocument(document, this.getViewColumn() + 1, false);
        }

    }

    public editOutput(content: string) {

        const mutableEditor = vscode.window.visibleTextEditors.concat().reverse();

        const untitled = mutableEditor.find(
            (untitled) => untitled.document.isUntitled
        );

        return untitled?.edit(editBuilder => {
            const document = untitled?.document;

            editBuilder.replace(new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end), content);
        }) ?? '';
    }

    public getViewColumn() {
        return vscode.window.visibleTextEditors.length;
    }

    public generateOutput(content: string) {
        return JSON.stringify(JSON.parse('{ "output":' + content + ' }'), null, 4);
    }

    public decode(format: string, buffer: ArrayBuffer) {
        const decoder = new TextDecoder(format);
        const data = decoder.decode(buffer);

        return data
    }
}