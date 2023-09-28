import * as vscode from 'vscode';
import fetch, { Request } from 'node-fetch';
import path = require('path');

export function activate(context: vscode.ExtensionContext) {

	const extensionDir = context.extensionPath;
	const resourcesPath = path.join(extensionDir, 'src', 'resources');

	const disposable = vscode.commands.registerCommand('extension.jolt', () => {
		transform();
	});

	const windowDisposable = vscode.commands.registerCommand('openWindow.jolt', () => {
		openWindows(resourcesPath);
	});

	const fileDisposable = vscode.commands.registerCommand('file.jolt', () => {
		transformFromFile();
	});

	context.subscriptions.push(disposable, windowDisposable, fileDisposable);
}

async function openWindows(resourcesPath: string) {

	const input = await vscode.workspace.openTextDocument(path.join(resourcesPath, 'input.json'));
	const spec = await vscode.workspace.openTextDocument(path.join(resourcesPath, 'spec.json'));

	vscode.window.showTextDocument(input, vscode.ViewColumn.Beside, false);
	vscode.window.showTextDocument(spec, vscode.ViewColumn.Beside, true);
}

function getContent(json: string) {

	const textDocuments = vscode.workspace.textDocuments;

	const content = textDocuments.find((document) => {
		const text = document.getText();
		if(json == "spec")
			return text.startsWith('[');
		return text.startsWith('{');

	  });
	return content?.getText() ?? '';
}

async function transform() {

	
	const spec = getContent("spec");
	const input = getContent("input");
	const sort = false;

	if (!spec || !input) {
		throw new vscode.CancellationError();
	}

	jolt(input, spec, sort);

}

async function transformFromFile() {

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

	console.log(input);
	console.log(spec);

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
			printOutput(result);
			vscode.window.showInformationMessage("JOLT transform successful");
		})
		.catch(error => {
			printOutput(error);
			vscode.window.showInformationMessage("Error, check your json file")
		});
}

async function openDocument(content: string, language?: string) {
	const document = await vscode.workspace.openTextDocument({
		language,
		content
	});

	return document;
}

async function printOutput(content: string, language?: string) {
	const document = await vscode.workspace.openTextDocument({
		language,
		content,
	});

	vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, true);
	
}
