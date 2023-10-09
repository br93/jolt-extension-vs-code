import * as vscode from 'vscode';
import fetch, { Request } from 'node-fetch';
import path = require('path');
import { TextEncoder, TextDecoder } from 'node:util';

export function activate(context: vscode.ExtensionContext) {

	const extensionDir = context.extensionPath;
	const resourcesPath = path.join(extensionDir, 'src', 'resources');

	const disposable = vscode.commands.registerCommand('extension.jolt', () => {
		transform(resourcesPath);
	});

	const windowDisposable = vscode.commands.registerCommand('openWindow.jolt', () => {
		openWindows(resourcesPath);
	});

	context.subscriptions.push(disposable, windowDisposable);
}

async function openWindows(resourcesPath: string) {

	const input = await vscode.workspace.openTextDocument(path.join(resourcesPath, 'INPUT.json'));
	const spec = await vscode.workspace.openTextDocument(path.join(resourcesPath, 'SPEC.json'));

	vscode.window.showTextDocument(input, vscode.ViewColumn.Beside, false);
	vscode.window.showTextDocument(spec, vscode.ViewColumn.Beside, true);
}

function getContent(json: string) {

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

async function transform(resourcesPath: string) {

	const spec = getContent("spec");
	const input = getContent("input");
	const sort = false;

	if (!spec || !input) {
		vscode.window.showInformationMessage("Error, check your json file");
		throw new vscode.CancellationError();
	}

	jolt(input, spec, sort, resourcesPath);

}

async function jolt(input: string, spec: string, sort: boolean, resourcesPath: string) {

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
			showOutput(generateOutput(text), resourcesPath);

			if (text.startsWith("{"))
				vscode.window.showInformationMessage("JOLT transform successful");
			else
				vscode.window.showInformationMessage(text);

		})
		.catch(error => {
			showOutput(JSON.stringify(error), "json");
			vscode.window.showInformationMessage("Error, check your json file");
		});
}

async function showOutput(content: string, resourcesPath: string) {

	try {
		const outputPath = path.join(resourcesPath, "OUTPUT.json");
		const fileUri = vscode.Uri.parse(outputPath);

		await vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(content));
		const output = await vscode.workspace.openTextDocument(outputPath);
		await vscode.window.showTextDocument(output, vscode.ViewColumn.Beside, true);
	} catch {
		showUntitledOutput(content, "json");
	}

}

async function showUntitledOutput(content: string, language?: string) {

	const alreadyExists = editUntitledOutput(content);

	if (!alreadyExists) {
		const document = await vscode.workspace.openTextDocument({
			language,
			content,
		});

		vscode.window.showTextDocument(document, getViewColumn() + 1, true);
	}

}

function editUntitledOutput(content: string) {

	const mutableEditor = vscode.window.visibleTextEditors.concat();

	const untitled = mutableEditor.find(
		(untitled) => untitled.document.isUntitled
	);

	return untitled?.edit(editBuilder => {
		const document = untitled?.document;
		
			editBuilder.replace(new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end), content);
	}) ?? '';
}

function getViewColumn() {
	return vscode.window.visibleTextEditors.length;
}

function generateOutput(content: string){
	return JSON.stringify(JSON.parse('{ "output":'  + content + ' }'), null, 4);
}