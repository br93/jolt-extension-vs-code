(
    function () {
        const vscode = acquireVsCodeApi();
        document.getElementById('jolt-windows').addEventListener('click', () => {
            vscode.postMessage({
                action: POST_MESSAGE_ACTION.CREATE_INPUT_OUTPUT
            });
        });

        document.getElementById('jolt').addEventListener('click', () => {
            vscode.postMessage({
                action: POST_MESSAGE_ACTION.JOLT_TRANSFORM
            });
        });

        document.getElementById('jslt-windows').addEventListener('click', () => {
            vscode.postMessage({
                action: POST_MESSAGE_ACTION.CREATE_JSLT_JSON
            });
        });

        document.getElementById('jslt').addEventListener('click', () => {
            vscode.postMessage({
                action: POST_MESSAGE_ACTION.JSLT_TRANSFORM
            });
        });
        
    }()
);