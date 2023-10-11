import * as vscode from 'vscode';
import fetch, { Request } from 'node-fetch';
import { VSCodeActions } from './actions';
import { Transformation } from './interfaces/transformation';

class JoltTransformation implements Transformation{

    private actions: VSCodeActions

    constructor() {
        this.actions = JoltTransformation.createAction();
    }
    
    static createAction(): VSCodeActions {
        return new VSCodeActions();
    }

    async openWindows(resourcesPath: string) {
        this.actions.openWindow(resourcesPath, 'jolt', 'INPUT.json', 'SPEC.json');
    }
    
    getContent(json: string) {
    
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
    
    async transform() {
    
        const spec = this.getContent("spec");
        const input = this.getContent("input");
        const sort = false;
    
        if (!spec || !input) {
            vscode.window.showInformationMessage("Error, check your json file");
            throw new vscode.CancellationError();
        }
    
        this.jolt(input, spec, sort);
    
    }

    private async jolt(input: string, spec: string, sort: boolean) {
    
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
                this.actions.showOutput(this.actions.generateOutput(text), "json");
    
                if (text.startsWith("{"))
                    vscode.window.showInformationMessage("JOLT transform successful");
                else
                    vscode.window.showInformationMessage(text);
    
            })
            .catch(error => {
                this.actions.showOutput(JSON.stringify(error), "json");
                vscode.window.showInformationMessage("Error, check your json file");
            });
    }

}

export const jolt = new JoltTransformation();