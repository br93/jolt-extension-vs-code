import * as vscode from "vscode";
import View from '../components/View';
import * as ReactDOMServer from "react-dom/server";

import { jolt } from "../../jolt";
import { getNonce } from "../getNonce";

export class JoltWebview implements vscode.WebviewViewProvider {
	constructor(
		private readonly extensionPath: vscode.Uri,
		private readonly resourcesPath: string,
		private data: any,
		private _view: any = null
	) {}
    private onDidChangeTreeData: vscode.EventEmitter<undefined | null | void> = new vscode.EventEmitter<undefined | null | void>();

    refresh(context: any): void {
        this.onDidChangeTreeData.fire(null);
        this._view.webview.html = this._getHtmlForWebview(this._view?.webview);
    }

	resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.extensionPath],
		};
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		this._view = webviewView;
		this.activateMessageListener();
	}

	private activateMessageListener() {
		
		this._view.webview.onDidReceiveMessage((message: { action: any; }) => {
			switch (message.action){
				case 'CREATE_INPUT_OUTPUT':
					jolt.openWindows(this.resourcesPath);
					break;
				case 'JOLT_TRANSFORM':
					jolt.transform(this.resourcesPath);
					break;
				default:
					vscode.window.showWarningMessage("error");
					break;
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview) {

		const styleResetUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this.extensionPath, "media", "reset.css")
		);

        const styleVSCodeUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this.extensionPath, "media", "vscode.css")
		);

        const styleViewUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionPath, "media", "view.css")
        );

		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this.extensionPath, "media", "jolt.js")
		);
		const postUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this.extensionPath, "media", "post.js")
		);

		const nonce = getNonce();

		return `<html>
                <head>
                    <meta charSet="utf-8"/>
                    <meta http-equiv="Content-Security-Policy" 
                            content="default-src 'none';
                            img-src vscode-resource: https:;
                            font-src ${webview.cspSource};
                            style-src ${webview.cspSource} 'unsafe-inline';
                            script-src 'nonce-${nonce}'
							
							;">             

                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${styleResetUri}" rel="stylesheet" />
                    <link href="${styleVSCodeUri}" rel="stylesheet">
					<link href="${styleViewUri}" rel="stylesheet">

                </head>
                <body>
                    ${                   
                        ReactDOMServer.renderToString((
							<View title={"Jolt transformation"}></View>
						))
                    }
					<script nonce="${nonce}" type="text/javascript" src="${postUri}"></script>
					<script nonce="${nonce}" src="${scriptUri}"></script>
				</body>
            </html>`;
	}
}
