import * as vscode from 'vscode';
import path = require('path');

export class VSCodeActions {

    private outputEditor?: vscode.TextEditor;

    async openWindows(resourcesPath: string, transformation: string, firstFile: string, secondFile: string) {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        this.outputEditor = undefined;

        const firstWindow = await vscode.workspace.openTextDocument(path.join(resourcesPath, transformation, firstFile));
        await vscode.window.showTextDocument(firstWindow, vscode.ViewColumn.Beside, false);

        const secondWindow = await vscode.workspace.openTextDocument(path.join(resourcesPath, transformation, secondFile));
        await vscode.window.showTextDocument(secondWindow, vscode.ViewColumn.Beside, true);
    }

    async openWindow(resourcesPath: string, transformation: string, file: string) {

        const firstWindow = await vscode.workspace.openTextDocument(path.join(resourcesPath, transformation, file));
        vscode.window.showTextDocument(firstWindow, vscode.ViewColumn.Beside, false);
    }

    async showOutput(content: string, language?: string) {

        const outputEditor = this.outputEditor && !this.outputEditor.document.isClosed
            ? this.outputEditor
            : this.findEditorByTitle('OUTPUT');

        if (outputEditor) {
            this.outputEditor = outputEditor;
            await this.replaceEditorContent(outputEditor, content);
        } else {
            const document = await vscode.workspace.openTextDocument({
                language,
                content,
            });

            this.outputEditor = await vscode.window.showTextDocument(document, vscode.ViewColumn.Three, false);
        }
    }

    private async replaceEditorContent(editor: vscode.TextEditor, content: string) {
        const document = editor.document;
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );

        await editor.edit((editBuilder) => {
            editBuilder.replace(fullRange, content);
        });
    }

    async openOutput(resourcesPath: string, transformation: string, file: string, content: string, language?: string) {

        const alreadyOpen = this.editOutput(content);

        if (!alreadyOpen) {
            const outputDocument = await vscode.workspace.openTextDocument(path.join(resourcesPath, transformation, file));
            vscode.languages.setTextDocumentLanguage(outputDocument, language || "json")
            vscode.window.showTextDocument(outputDocument, vscode.ViewColumn.Beside, false).then((editor) => {
                editor.edit((editBuilder) => {
                    const fullRange = new vscode.Range(
                        outputDocument.positionAt(0),
                        outputDocument.positionAt(outputDocument.getText().length)
                    );
                    editBuilder.replace(fullRange, content);
                })
            });
        }

    }

    public editOutput(content: string) {

        // const outputEditor = vscode.window.visibleTextEditors.find((editor) => {
        //     editor.document.fileName.startsWith('OUTPUT')
        // });

        const outputEditor = this.findEditorByTitle('OUTPUT');
        
        if (!outputEditor)
            return false;

        return outputEditor?.edit(editBuilder => {
            const document = outputEditor?.document;

            editBuilder.replace(new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end), content);
        }) ?? '';
    }

    public getViewColumn() {
        return vscode.window.visibleTextEditors.length;
    }

    public generateOutput(content: string) {
        return JSON.stringify(JSON.parse(content), null, 4);
    }

    public decode(format: string, buffer: ArrayBuffer) {
        const decoder = new TextDecoder(format);
        const data = decoder.decode(buffer);

        return data
    }

    private isOutput(output: vscode.TextEditor | undefined){
        return (output?.document.languageId == "jsonc")
    }

    private findEditorByTitle(title: string){
        const editors = vscode.window.visibleTextEditors;

        for (const editor of editors) {
            const fileName = editor.document.fileName;
    
            if (fileName.includes(title)) {
                return editor;
            }
        }
        return false;
    } 
}