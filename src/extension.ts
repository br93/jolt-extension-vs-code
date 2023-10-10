import * as vscode from 'vscode';
import path = require('path');
import { JoltWebview } from './webview/providers/SidebarProvider';
import { jolt } from './jolt';

export function activate(context: vscode.ExtensionContext) {

	const extensionDir = context.extensionPath;
	const resourcesPath = path.join(extensionDir, 'src', 'resources');

	const disposable = vscode.commands.registerCommand('extension.jolt', () => {
		jolt.transform(resourcesPath);
	});

	const windowDisposable = vscode.commands.registerCommand('openWindow.jolt', () => {
		jolt.openWindows(resourcesPath);
	});

	context.subscriptions.push(disposable, windowDisposable);

	const sidebar = new JoltWebview(context?.extensionUri, resourcesPath, {});
	let view = vscode.window.registerWebviewViewProvider(
		"jolt-webview",
		sidebar,
	);
	context.subscriptions.push(view);
}