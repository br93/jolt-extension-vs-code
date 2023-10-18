import * as vscode from 'vscode';
import path = require('path');
import fetch, { Request } from 'node-fetch';
import { Transformation } from './interfaces/transformation';
import { VSCodeActions } from './actions';

class JsltTransformation implements Transformation {

    private actions: VSCodeActions

    constructor() {
        this.actions = JsltTransformation.createAction();
    }

    static createAction(): VSCodeActions {
        return new VSCodeActions();
    }

    async openWindows(resourcesPath: string) {
        this.actions.openWindows(resourcesPath, 'jslt', 'JSLT.txt', 'JSON.json');
    }

    getContent(origin: string) {

        const textDocuments = vscode.workspace.textDocuments;

        const content = textDocuments.find((document) => {
            const fileName = document.fileName;

            switch (origin) {
                case "jslt":
                    return fileName.endsWith('JSLT.txt');
                case "json":
                    return fileName.endsWith('JSON.json');
                default:
                    break;
            }

        });

        return content?.getText() ?? '';
    }

    async transform() {

        const jslt = this.getContent("jslt");
        const json = this.getContent("json");

        if (!jslt || !json) {
            vscode.window.showInformationMessage("Error, check your jslt and json files");
            throw new vscode.CancellationError();
        }

        this.jslt(jslt, json);
    }

    private async jslt(jslt: string, json: string) {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jslt: jslt,
                json: json
            })

        };

        const request = new Request('https://www.garshol.priv.no/jslt-demo', requestOptions);

        fetch(request)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                return this.actions.decode('iso-8859-1', buffer);
            })
            .then(text => {

                if (text.startsWith("{")) {
                    vscode.window.showInformationMessage("JSLT transform successful");
                    this.generateReport(jslt, json, this.actions.generateOutput(text));
                }
                else {
                    this.actions.showOutput(this.actions.generateOutput(text), "json");
                    vscode.window.showInformationMessage(text);
                }
            })
            .catch(error => {
                this.actions.showOutput(JSON.stringify(error), "json");
                vscode.window.showInformationMessage("Error, check your json file");
            });
    }

    private async generateReport(jslt: string, json: string, output: string) {
        const report = JSON.stringify({
            input: {
                jslt: jslt,
                payload: json
            }
        }, null, 4);
        
        await this.actions.showOutput(report.slice(0, -1) + "," + "\"output\": " + output + "}" , "json");
        vscode.commands.executeCommand('editor.action.formatDocument');
    }
}

export const jslt = new JsltTransformation();
