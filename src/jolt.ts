import * as vscode from 'vscode';
import fetch, { Request } from 'node-fetch';
import { VSCodeActions } from './actions';
import { Transformation } from './interfaces/transformation';
import path = require('path');

class JoltTransformation implements Transformation {

    private actions: VSCodeActions

    constructor() {
        this.actions = JoltTransformation.createAction();
    }

    static createAction(): VSCodeActions {
        return new VSCodeActions();
    }

    async openWindows(resourcesPath: string) {

        const operation = await this.getOperation();
        await this.actions.openWindow(resourcesPath, 'jolt', 'INPUT.json');
        
        if (operation)
            await this.editSpec(operation);
        else this.actions.openWindow(resourcesPath, 'jolt', 'SPEC.json')
    }

    async getOperation() {
        const operations = ['shift', 'default', 'remove', 'sort', 'cardinality', 'modify-default-beta', 'modify-overwrite-beta'];

        return await vscode.window.showQuickPick(operations, {
            placeHolder: 'Select the operation you want to perform: ',
            onDidSelectItem: item => { return item }
        }) ?? '';
    }

    async editSpec(operation: string) {
        
        const content = this.buildSpecJSON(operation);
        const language = "json";

        const document = await vscode.workspace.openTextDocument({
                language,
                content,
            });

        vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, false); 
    }

    private buildSpecJSON(operation: string) {
        return JSON.stringify([{
            operation: operation,
            spec: {}
        }], null, 4);
    }


    getContent(json: string) {

        const textDocuments = vscode.workspace.textDocuments;

        const content = textDocuments.find((document) => {
            const text = document.getText();
            const fileName = document.fileName;

            if (document.languageId.includes("jsonc"))
                return

            if (json == "spec")
                return fileName.endsWith('SPEC.json') || text.startsWith('[');
            return fileName.endsWith('INPUT.json') || (text.startsWith('{'));

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
                return this.actions.decode('iso-8859-1', buffer);
            })
            .then(text => {
                if (text.startsWith("{") || text.startsWith("null")) {
                    // this.actions.showOutput(this.actions.generateOutput(text), "jsonc");
                    this.actions.openOutput(resourcesPath, 'jolt', 'OUTPUT.json', text)
                    vscode.window.showInformationMessage("JOLT transform successful");
                } else {
                    vscode.window.showErrorMessage("Error! Check your JSON File", {detail: text, modal: true});
                }

            })
    }

}

export const jolt = new JoltTransformation();