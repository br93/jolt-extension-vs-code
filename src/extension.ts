import * as vscode from 'vscode';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
	
	const disposable = vscode.commands.registerCommand('extension.jolt', () => {
		transform();
	});

	context.subscriptions.push(disposable);
}

async function transform(){
	
	const input = await openJSON("input.json");
	const spec = await openJSON("spec.json");
	const sort = false;

	jolt(input, spec, sort);
	
}

async function openJSON(name: string){
		
	return vscode.workspace.openTextDocument(workspaceFolder() + "/" + name)
	.then((document) => {
		const text = document.getText();
		return text;
	},
	(error) => {
		vscode.window.showInformationMessage("File " + name + ".json not found in rootPath");
		console.log("File " + name + ".json not found in rootPath");
		throw new vscode.CancellationError();
	});
}

function workspaceFolder(){
	if (!vscode.workspace.workspaceFolders) {
        vscode.window.showInformationMessage("Open a folder/workspace first");
		console.log('Open a folder/workspace first and try again');
        throw new vscode.CancellationError();
    }

	return vscode.workspace.workspaceFolders[0].uri.fsPath;
}



async function jolt(input:string, spec:string, sort:boolean) {

	try {
		const response = await fetch('https://jolt-demo.appspot.com/transform?input=' + encodeURIComponent(input) + '&spec=' + encodeURIComponent(spec) + '&sort=' + sort, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			
		});

		if (!response.ok) {
			throw new Error(`Error! status: ${response.status}`);
		}

		const jolt = (await response.json());
		const result = JSON.stringify(jolt, null, 4);
		
		printOutput(result, "json");
		vscode.window.showInformationMessage("JOLT transform successful");	


	} catch (error) {
		if (error instanceof Error) {
			console.log('error message: ', error.message);
			vscode.window.showInformationMessage("Check your json files");	
			throw new vscode.CancellationError();
		} else {
			console.log('unexpected error: ', error);
			throw new vscode.CancellationError();
		}


	
}}

async function printOutput(content: string, language?: string) {
    const document = await vscode.workspace.openTextDocument({
        language,
        content,
    });
    
	vscode.window.showTextDocument(document);
}
