/*
 * This js files contains the code associated with the toolbar in the left hand pane
 * The functions below are called whenever a button on the toolbar is pressed, or the user drags a shape to the canvas
 */

/*
 * Standard html5 drag/drop is used
 * This function is called when the shape image is initially dragged 
 */
function drag(ev){
	
	// set the id of the shape being dragged
	ev.dataTransfer.setData("text", ev.target.id);
	
	// When the shape is dropped we want to position it (at least approximately) correctly
	// We calculate the offset from the top left of the shape to where the mouse pointer is
	// Note that we use padding in the html to move the shape in the toolbar panel down from the very top
	// and this padding appears as part of the shape dimensions, even though it's not visible to the user
	
	let paddingTop = parseFloat(window.getComputedStyle(ev.target, null).getPropertyValue('padding-top'));
	
	// mouse position is given by ev.pageX, ev.pageY
	// shape position (including padding) is given by x and y values of client rectangle of ev.target
	
	let rect = ev.target.getBoundingClientRect();
	
	let xOffset = ev.pageX - rect.x; 
	let yOffset = ev.pageY - (rect.y + paddingTop);
	ev.dataTransfer.setData("xOffset", xOffset); // x offset of mouse from top left of VISIBLE shape
	ev.dataTransfer.setData("yOffset", yOffset); // y offset of mouse from top left of VISIBLE shape
}

/*
 * Standard html5 drag/drop is used
 * This function allows you to drag/drop the element
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/*
 * Standard html5 drag/drop is used
 * This function is called when the shape image is dropped onto the canvas
 */
function drop(ev) {

	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");  // set to the html id of the shape

	// We have to specify where to draw the shape relative to the top left of the graph area
	// ev.pageX, ev.pageY gives the position of the mouse when the drop occurs
	// We have to take into account the offsets to the top left of the shape being dragged (passed in the transfer data)
	// and then create the draw2d command at the position relative to the graphics container.
	// We also have to take account of the current zoom level, and provide a correction for it
	let xOffset = ev.dataTransfer.getData("xOffset");
	let yOffset = ev.dataTransfer.getData("yOffset");
	
	var rect = document.getElementById('gfx_container').getBoundingClientRect();
	
	var newShape;
	if (data == "stage") 
	{
		// create the new Workflow Stage object
		newShape = new WorkflowStage({userData:{published:"1", description:""}});
	}
	else if (data == "anystage")
	{
		// create a new Any Stage object
		newShape = new AnyStage({});
	}
	
	// ... and position it. Implement via the command stack so that undo/redo work
	let zoomLevel = canvas.getZoom();
	var command = new draw2d.command.CommandAdd(canvas, newShape, (ev.pageX - xOffset - rect.left) * zoomLevel, (ev.pageY - yOffset - rect.top) * zoomLevel);
	canvas.getCommandStack().execute(command);
}

/*
 * Function called when the undo button is pressed
 * It uses the draw2d command stack to undo the last action
 */
function undo() {
	canvas.getCommandStack().undo();
	return true;
}

/*
 * Function called when the redo button is pressed
 * It uses the draw2d command stack to redo the last undo
 */
function redo() {
	canvas.getCommandStack().redo();
	return true;
}

/*
 * Function called when the delete button is pressed
 * It deletes the selected transition or stage
 * The policy set up on the canvas ensures that there's only 1 item, and the start node is prevented from being deleted
 */
function deleteNode() {
	var node = canvas.getPrimarySelection();
	if (node) {
		var command= new draw2d.command.CommandDelete(node);
		canvas.getCommandStack().execute(command);
	}
	else {
		alert("Please select a Stage or Transition first");
	}
}

/*
 * Function called when the zoomin button is pressed
 * It uses the draw2d zoom facility to set the zoom
 */
function zoomin() {
	let newZoom = canvas.getZoom() * 0.8;
	canvas.setZoom(newZoom,true);
	let currentZoom = Math.round(100.0/newZoom);
	document.getElementById("currentZoom").innerHTML = currentZoom + "%";
}
/*
 * Function called when the zoomout button is pressed
 * It uses the draw2d zoom facility to set the zoom
 */
function zoomout() {
	let newZoom = canvas.getZoom() * 1.25;
	canvas.setZoom(newZoom,true);
	let currentZoom = Math.round(100.0/newZoom);
	document.getElementById("currentZoom").innerHTML = currentZoom + "%";
}

/*
 * Function called when the 1:1 button is pressed
 * It uses the draw2d zoom facility to set the zoom
 */
function resetZoom() {
	canvas.setZoom(1.0,true);
	document.getElementById("currentZoom").innerHTML = "100%"; 
}

/*
 * Function to get the graph data for saving
 */
function getGraphData() {
	
	var json = [];   // variable for storing the graph details
	
	// First get the shapes - the Start node and the Workflow and Any Stages
	let figures = canvas.getFigures().asArray();
	for (var i=0; i < figures.length; i++) {
		figure = figures[i];
		if (figure instanceof StartNode || figure instanceof AnyStage) 
		{
			json.push({type: figure.NAME, attr: {id: figure.id, x: figure.x, y: figure.y}});
		}
		else if (figure instanceof WorkflowStage) 
		{
			json.push({type: figure.NAME, attr: {id: figure.id, title: figure.title, x: figure.x, y: figure.y, width: figure.width, height: figure.height,
				userData: figure.userData}});
		}
	}
	
	// Now get the Transitions
	let lines = canvas.getLines().asArray();
	var defaultTransitionFound = false; 
	for (var i=0; i < lines.length; i++)  {
		line = lines[i];
		if (line instanceof WorkflowTransition)
		{
			json.push({type: line.NAME, attr: {id: line.id, title: line.title, userData: line.userData}, 
				sourceNode: line.sourcePort.parent.id, sourcePort: line.sourcePort.name, 
				targetNode: line.targetPort.parent.id, targetPort: line.targetPort.name});
		}
		else if (line instanceof DefaultTransition)
		{
			defaultTransitionFound = true;
			if (line.sourcePort.parent.NAME != "StartNode") 
			{	// Default Transition must start at the Start Nodel
				alert("The Default transition must start at the Start node");
				return false;
			}
			if (line.targetPort.parent.userData.published != 1) 
			{	// the Default Workflow Stage must have a status of Published
				alert("The Default Stage (pointed to by the Default transition from the start node) must have status Enabled");
				return false;
			}
			json.push({type: line.NAME, attr: {id: line.id}, 
				sourceNode: line.sourcePort.parent.id, sourcePort: line.sourcePort.name, 
				targetNode: line.targetPort.parent.id, targetPort: line.targetPort.name});
		}
	}
	
	if (!defaultTransitionFound) {	// There needs to be a default Stage using a Default Transition from the Start node
		alert("You must connect the Start node to a Stage to provide a default Workflow Stage");
		return false;
	}

	return json;
}
/*
 * Function to save the workflow graph and exit the graphical editor
 */
function save() {
	
	var graphData = getGraphData();
	
	if (graphData) {
		let jsonString = JSON.stringify(graphData);
		jQuery("#json").val(jsonString);
		Joomla.submitform('workflowgraph.save');
	}
}

/*
 * Function to save the workflow graph via Ajax
 */
function apply() {
	
	var graphData = getGraphData();
	if (jdebug) {
		console.log(graphData);
	}

	if (graphData) {
		let jsonString = JSON.stringify(graphData);
		let token = jQuery("#token").attr("name");
		jQuery.ajax({	// by default jQuery sends Ajax requests to the same URL as the current page
				data: { task: "workflowgraph.ajaxsave", [token]: "1", format: "json", json: jsonString },
			})
			.done(function(result, textStatus, jqXHR)
			{
				if (result.success) {
					// clear the command stack (otherwise we don't know if there are unsaved changes if the user hits cancel)
					canvas.getCommandStack().markSaveLocation();
				} else {
					if (jdebug) {
						console.log(result.message);
					}
				}
				// display the enqueued messages in the message area
				if (result.messages) {
					Joomla.renderMessages(result.messages);
				}
			})
			.fail(function(jqXHR, textStatus, errorThrown)
			{
				if (jdebug) {
					console.log('ajax call failed' + textStatus);
				}
			});
	}
}

/*
 * Function to cancel the workflow graph and exit the graphical editor
 */
function cancel() {
	let commandStack = canvas.getCommandStack();
	if (commandStack.undostack.length > 0) {
		if (!confirm("You have unsaved changes. Click ok to confirm you want to cancel.")) {
			return;
		}
	}
	Joomla.submitform('workflowgraph.cancel');
}

/*
 * Function to output diagnostic data in the console, eg the json associated with the graph shapes and lines
 */
function diagnostics() {
	let graphData = getGraphData();
	console.log(graphData);
	let commandStack = canvas.getCommandStack();
	console.log(commandStack);
	let ports = canvas.getAllPorts();
	console.log(ports);
}