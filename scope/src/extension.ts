// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as dgram from 'dgram';

let panel: vscode.WebviewPanel | null = null;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "scope" is now active!');


	const udpServer = dgram.createSocket('udp4');

	udpServer.on('message', (msg, rinfo) => {
		if (panel) {
			// Update Plotly graph here
			console.log(`Received ${msg} from ${rinfo.address}:${rinfo.port}`);
			panel.webview.postMessage(msg.toString());
		}
	});
	
	udpServer.bind(5005);  // Listen on port 5005
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('scope.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from scope!');

        panel = vscode.window.createWebviewPanel(
            'realTimePlot', 
            'Real Time Plot', 
            vscode.ViewColumn.One,
            {
                // Enable scripts in the webview
                enableScripts: true
            }
        );
		panel.webview.html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    </head>
    <body>
        <div id="plotly-graph"></div>
		<script>
const trace = {
	x: [0],
	y: [0],
	mode: 'lines+markers'
};

const layout = {
	title: 'Real-Time Plot',
	xaxis: { title: 'Time' },
	yaxis: { title: 'Value' }
};

Plotly.newPlot('plotly-graph', [trace], layout);

// window.addEventListener('message', event => {
//     const data = parseFloat(event.data); // Assuming data is a float
//     trace.x.push(new Date());  // Assuming x is time
//     trace.y.push(data);

//     // Update the plot
//     Plotly.update('plotly-graph', {x: [trace.x], y: [trace.y]});
// });

window.addEventListener('message', event => {
    console.log("Received message event:", event);
    
    const data = parseFloat(event.data); // Assuming data is a float
    console.log("Parsed data:", data);
    
    // trace.x.push(new Date());  // Assuming x is time
	trace.x.push(trace.x.length);  // Simple counter
    trace.y.push(data);

    console.log("Updated trace:", trace);

    // Update the plot
    Plotly.update('plotly-graph', {x: [trace.x], y: [trace.y]});
    console.log("Plot should be updated.");
});

		</script>
	</body>
    </html>
`;

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
