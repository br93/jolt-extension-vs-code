import * as vscode from 'vscode';

async function newOperation() {
    const snippet = new vscode.SnippetString(",\t{\n\t\t\"operation\": \"${1|shift,default,remove,sort,cardinality,modify-default-beta,modify-overwrite-beta|}\",\n\t\t\"spec\": {}\n\t}\n");

    const editor = vscode.window.activeTextEditor;
    const lastIndex = editor?.document.lineCount;
 
    if (lastIndex) {
        await editor?.insertSnippet(snippet, new vscode.Position(lastIndex - 1, 0));
        vscode.commands.executeCommand('editor.action.formatDocument');
    }
}



export { newOperation };