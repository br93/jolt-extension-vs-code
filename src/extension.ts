import * as vscode from 'vscode';
import fetch, { Request } from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('extension.jolt', () => {
		transform();
	});

	context.subscriptions.push(disposable);
}

async function transform() {

	const input = await openJSON("input.json");
	const spec = await openJSON("spec.json");
	const sort = false;

	jolt(input, spec, sort);

}

async function openJSON(name: string) {

	return vscode.workspace.openTextDocument(workspaceFolder() + "/" + name)
		.then((document) => {
			const text = document.getText();
			return text;
		},
			(error) => {
				vscode.window.showInformationMessage("File " + name + " not found in rootPath");
				throw new vscode.CancellationError();
			});
}

function workspaceFolder() {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("Open a folder/workspace first");
		throw new vscode.CancellationError();
	}

	return vscode.workspace.workspaceFolders[0].uri.fsPath;
}

async function jolt(input: string, spec: string, sort: boolean) {

	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ input: input, spec: spec, sort: sort.toString() }).toString()
	};
	const request = new Request('https://jolt-demo.appspot.com/transform', requestOptions);

	fetch(request)
		.then(response => response.json())
		.then(data => {
			const result = JSON.stringify(data, null, 4);
			printOutput(result, "json");
			vscode.window.showInformationMessage("JOLT transform successful");
		})
		.catch(error => {
			printOutput(error);
			vscode.window.showInformationMessage("Error, check your json file")
		});
}

async function printOutput(content: string, language?: string) {
	const document = await vscode.workspace.openTextDocument({
		language,
		content,
	});

	vscode.window.showTextDocument(document);
}
