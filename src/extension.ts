import * as vscode from 'vscode';
import path = require('path');
import { JoltWebview } from './webview/providers/SidebarProvider';
import { jolt } from './jolt';
import { jslt } from './jslt';
import { newOperation } from './codelens/codelens';
import JoltCodeLensProvider from './codelens/provider';

export function activate(context: vscode.ExtensionContext) {

	const extensionDir = context.extensionPath;
	const resourcesPath = path.join(extensionDir, 'src', 'resources');

	const disposable = vscode.commands.registerCommand('extension.jolt', () => {
		jolt.transform();
	});

	const windowDisposable = vscode.commands.registerCommand('openWindow.jolt', () => {
		jolt.openWindows(resourcesPath);
	});

	const jsltDisposable = vscode.commands.registerCommand('extension.jslt', () => {
		jslt.transform();
	});

	const jsltWindowDisposable = vscode.commands.registerCommand('openWindow.jslt', () => {
		jslt.openWindows(resourcesPath);
	});

	context.subscriptions.push(disposable, windowDisposable, jsltDisposable, jsltWindowDisposable);

	const sidebar = new JoltWebview(context?.extensionUri, resourcesPath, {});
	let view = vscode.window.registerWebviewViewProvider(
		"jolt-webview",
		sidebar,
	);
	
	context.subscriptions.push(view);

	const operation = vscode.commands.registerCommand('operation.jolt', newOperation);

	const json = {
		language: "json"
	}

	const codelens = vscode.languages.registerCodeLensProvider(json, new JoltCodeLensProvider());

	context.subscriptions.push(operation, codelens);
}