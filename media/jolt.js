(
    function () {
        const vscode = acquireVsCodeApi();
        document.getElementById('windows').addEventListener('click', () => {
            vscode.postMessage({
                action: POST_MESSAGE_ACTION.CREATE_INPUT_OUTPUT
            });
        });

        document.getElementById('jolt').addEventListener('click', () => {
            vscode.postMessage({
                action: POST_MESSAGE_ACTION.JOLT_TRANSFORM
            });
        });
    }()
);