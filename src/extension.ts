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
	vscode.window.showTextDocument(spec, vscode.ViewColumn.Beside, false);
}

function getContent(json: string) {

	const textDocuments = vscode.workspace.textDocuments;

	const content = textDocuments.find((document) => {
		const text = document.getText();
		if (json == "spec")
			return text.startsWith('[');
		return text.startsWith('{');

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

			editOutput(data, resourcesPath);

			if (data.startsWith("{"))
				vscode.window.showInformationMessage("JOLT transform successful");
			else
				vscode.window.showInformationMessage(data);

		})
		.catch(error => {
			printOutput(JSON.stringify(error), "json");
			vscode.window.showInformationMessage("Error, check your json file");
		});
}

async function editOutput(content: string, resourcesPath: string) {

	try {
		const outputPath = path.join(resourcesPath, "OUTPUT.json");
		const fileUri = vscode.Uri.parse(outputPath);

		await vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(content));
		const output = await vscode.workspace.openTextDocument(outputPath);
		await vscode.window.showTextDocument(output, vscode.ViewColumn.Beside, true);
	} catch {
		printOutput(content, "json");
	}


}

async function resetOutput(resourcesPath: string) {
	await editOutput("null", resourcesPath);
}

async function printOutput(content: string, language?: string) {
	const document = await vscode.workspace.openTextDocument({
		language,
		content,
	});

	vscode.window.showTextDocument(document);
}
