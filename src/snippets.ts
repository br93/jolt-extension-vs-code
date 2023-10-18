import * as vscode from 'vscode';

export const newOperationSnippet = new vscode.SnippetString(",\t{\n\t\t\"operation\": \"${1|shift,default,remove,sort,cardinality,modify-default-beta,modify-overwrite-beta|}\",\n\t\t\"spec\": {}\n\t}\n");
export const autoCompleteSnippet = new vscode.SnippetString(": \"${1|shift,default,remove,sort,cardinality,modify-default-beta,modify-overwrite-beta|}\",");
