import * as vscode from 'vscode';
import fetch, { Request } from 'node-fetch';
import path = require('path');
import { TextDecoder } from 'node:util';

class JoltTransformation {

    async openWindows(resourcesPath: string) {

        const input = await vscode.workspace.openTextDocument(path.join(resourcesPath, 'INPUT.json'));
        const spec = await vscode.workspace.openTextDocument(path.join(resourcesPath, 'SPEC.json'));
    
        vscode.window.showTextDocument(input, vscode.ViewColumn.Beside, false);
        vscode.window.showTextDocument(spec, vscode.ViewColumn.Beside, true);
    }
    
    private getContent(json: string) {
    
        const textDocuments = vscode.workspace.textDocuments;
    
        const content = textDocuments.find((document) => {
            const text = document.getText();
            const fileName = document.fileName;
    
            if (json == "spec")
                return fileName.endsWith('SPEC.json') || text.startsWith('[');
            return fileName.endsWith('INPUT.json') || (text.startsWith('{') && !text.includes("output"));
    
        });
    
        return content?.getText() ?? '';
    }
    
    async transform(resourcesPath: string) {
    
        const spec = this.getContent("spec");
        const input = this.getContent("input");
        const sort = false;
    
        if (!spec || !input) {
            vscode.window.showInformationMessage("Error, check your json file");
            throw new vscode.CancellationError();
        }
    
        this.jolt(input, spec, sort, resourcesPath);
    
    }
    
    private async jolt(input: string, spec: string, sort: boolean, resourcesPath: string) {
    
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ input: input, spec: spec, sort: sort.toString() }).toString(),
    
        };
        const request = new Request('https://jolt-demo.appspot.com/transform', requestOptions);
    
        fetch(request)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const decoder = new TextDecoder('iso-8859-1');
                const data = decoder.decode(buffer);
    
                return data
            })
            .then(text => {
                this.showOutput(this.generateOutput(text), "json");
    
                if (text.startsWith("{"))
                    vscode.window.showInformationMessage("JOLT transform successful");
                else
                    vscode.window.showInformationMessage(text);
    
            })
            .catch(error => {
                this.showOutput(JSON.stringify(error), "json");
                vscode.window.showInformationMessage("Error, check your json file");
            });
    }
    
    private async showOutput(content: string, language?: string) {
    
        const alreadyExists = this.editOutput(content);
    
        if (!alreadyExists) {
            const document = await vscode.workspace.openTextDocument({
                language,
                content,
            });
    
            vscode.window.showTextDocument(document, this.getViewColumn() + 1, true);
        }
    
    }
    
    private editOutput(content: string) {
    
        const mutableEditor = vscode.window.visibleTextEditors.concat().reverse();
    
        const untitled = mutableEditor.find(
            (untitled) => untitled.document.isUntitled
        );
    
        return untitled?.edit(editBuilder => {
            const document = untitled?.document;
            
                editBuilder.replace(new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end), content);
        }) ?? '';
    }
    
    private getViewColumn() {
        return vscode.window.visibleTextEditors.length;
    }
    
    private generateOutput(content: string){
        return JSON.stringify(JSON.parse('{ "output":'  + content + ' }'), null, 4);
    }

}

export const jolt = new JoltTransformation();