import * as vscode from 'vscode';

class JoltCodeLensProvider implements vscode.CodeLensProvider {

    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {

        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });

    }

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {

        if (vscode.workspace.getConfiguration("codelens").get("enable", true)) {
            const operation: vscode.Command = {
                command: "operation.jolt",
                "title": "JOLT (New operation)"
            };

            const codelens = new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), operation);

            return [codelens];
        }

        return [];
    }

}

export default JoltCodeLensProvider;