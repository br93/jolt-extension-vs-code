import * as vscode from 'vscode';

class JoltCodeLensProvider implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        const operation: vscode.Command = {
            command: "operation.jolt",
            "title": "JOLT (New operation)"
        };

        const codelens = new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), operation);

        return [codelens];
    }

}

export default JoltCodeLensProvider;