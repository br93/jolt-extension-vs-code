import * as vscode from 'vscode';

class Snippet {
    newOperationSnippet() {
        return new vscode.SnippetString(",\t{\n\t\t\"operation\": \"${1|shift,default,remove,sort,cardinality,modify-default-beta,modify-overwrite-beta|}\",\n\t\t\"spec\": {}\n\t}\n");
    }
    
    autoCompleteOperationSnippet() {
        return new vscode.SnippetString(": \"${1|shift,default,remove,sort,cardinality,modify-default-beta,modify-overwrite-beta|}\",");
    }
    
}

export const newOperationSnippet = new Snippet().newOperationSnippet();
export const autoCompleteSnippet = new Snippet().autoCompleteOperationSnippet();
