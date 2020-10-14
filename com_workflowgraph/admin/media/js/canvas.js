// Global variable used throughout to get the draw2d canvas object
var canvas = null;

// Global variable used throughout specifying if debug is on or not
var jdebug = false;

/*
 * Function to set up the draw2d shapes in the graph, based on what has been passed from the server.
*/
function build_graph(graphInfo, defaultStageId) {
	
/*
 * What is received from the server is a json string structured as an array of elements. 
 * 	
 * Each element is of the form:
 * 	type: 	one of StartNode / AnyStage / WorkflowStage / WorkflowTransition / DefaultTransition
 * 			The order in which these are sent is important, and is set in the server:
 * 			1) StartNode and AnyStage objects (if they exist - if the graph hasn't been run before for this workflow then they won't exist)
 * 			2) Workflow Stages 
 * 			3) DefaultTransition (if it exists)
 * 			4) Workflow Transitions
 * 			In drawing the graph shapes must exist before transitions between them can be implemented.
 * 			There is a draw2d class associated with each of these types
 * 	attr: 	attributes associated with the shape, which and individual attributes are of 2 types
 * 			1) graphical attributes - these are associated with the position of the shape, its size, etc.
 * 				These will be absent if this is the first time that the graph is executed for this workflow.
 * 			2) data attributes (WorkflowStage and WorkflowTransition only) - these are attributes which come from fields of the 
 * 				Workflow Stage and Workflow Transition database tables. 
 * 				The userData attribute is set up on the server based on data (eg 'published' field) in the database.
 * 				For Workflow Transitions these attributes include the from_stage_id and to_stage_id fields
 * 	sourceNode, sourcePort, targetNode, targetPort: for types WorkflowTransition and DefaultTransition only. These relate to the
 * 			draw2d shape and port at the source and target ends of the transition, and reflect what was last saved from the graph.
 * 			They will be absent if this is the first time that the graph is executed for this workflow.
 * 			
 * Explanation of the types:
 * WorkflowStage, WorkflowTransition - these represent the workflow stages and transitions in the Joomla functionality
 * AnyStage - this represents the case where there can be a transition from any stage (implemented as setting -1 in the from_stage_id field)
 * StartNode and DefaultTransition - together these support the concept of having a default stage - the DefaultTransition points to this 
 *   default stage and the StartNode is something to attach this DefaultTransition onto
 * 
 * The general approach in building the graph is as follows:
 * 
 * 1) For each type the code creates an instance of the associated draw2d class, passing the 'attr' attributes. 
 * There will be attributes in the attr list which aren't recognised by the draw2d software, but that's ok.
 * It may be that there aren't graphical attributes associated with a shape, in which case a default position is used. 
 * For multiple workflow stages this means cascading them down towards bottom right.
 * 
 * 2) There are certain items which are necessary to have in the graph
 * 	StartNode - prerequisite for a DefaultTransition - if one isn't received by the time we're implementing a DefaultTransition
 * 		then a default StartNode is implemented.
 * 	DefaultTransition - the save would fail at the server database level if this is not present
 * 	AnyStage - prerequisite for a Workflow Transition with from_stage_id = -1. 
 * 		An AnyStage shape isn't really necessary if we don't have such transitions, but it's output anyway.
 * The build function ensures that prerequisite shapes are present before implementing the transitions which depend on them. 
 * A StartNode and DefaultTransition are always implemented even if those types are not received from the server. 
 * 
 * 3) The source/target nodes and source/target ports represent the transitions WHEN THE GRAPH WAS LAST SAVED.	
 *    If a user has changed the transitions on the server using the forms rather than the graph then this data will be out of date.
 *    This graph build function compares the source/target nodes with the from_stage_id and to_stage_id values. 
 *    If they match then source/target ports are used as well.
 *    If they don't match then source/target ports are chosen based on what type of shape the source/target node is.
 * 
*/
	// keep track of whether key shapes have been created
	var startnodeCreated = false; 
	var anystageCreated = false; 
	var defaultCreated = false; 
	
	// for positioning successive WorkflowStages without graphical attributes
	// we add a random factor in case the user adds additional Stages via the forms, and they overlap initial ones on subsequent reload
	var nextStageX = 250 + Math.random() * 10, nextStageY = 10 + Math.random() * 10;  
	
	// shapes needed for certain transitions
	var anystage = null;
	var startnode = null;
	
	let json = JSON.parse(graphInfo);
	json.forEach(function(element) {
	
		if (element.type == "StartNode") {
			startnode = new StartNode(element.attr);
			canvas.add(startnode);
			startnodeCreated = true;
			
		} else if (element.type == "AnyStage") {
			anystage = new AnyStage(element.attr);
			canvas.add(anystage);
			anystageCreated = true;
			
		} else if (element.type == "WorkflowStage") {
			var s = new WorkflowStage(element.attr);
			if (element.attr.x) {  // used to check if graphical attributes have been set
				canvas.add(s);
			} else {	// use a default position, cascading down to the right
				canvas.add(s, nextStageX, nextStageY);
				nextStageX += 50;
				nextStageY += 150;
			}
			
		} else if (element.type == "WorkflowTransition") {
			if (!anystageCreated) {	// create one, just in case
				anystage = new AnyStage();
				canvas.add(anystage);
				anystageCreated = true;
			}
			var t = new WorkflowTransition(element.attr);
			
			// handling the source node
			if (element.attr.from_stage_id == -1) {  // from any stage
				if (element.sourceNode != undefined && canvas.getFigure(element.sourceNode) instanceof AnyStage) {
					// if there's a specific AnyStage shape which was used last time the graph was executed
					const sourceNode = canvas.getFigure(element.sourceNode);
					t.setSource(sourceNode.getOutputPort(0));
				}
				else { // just use the last AnyStage shape created
					const sourceNode = anystage;
					t.setSource(sourceNode.getOutputPort(0));
				}
			}
			else if (element.sourceNode != undefined && element.sourceNode == element.attr.from_stage_id) { // from a WorkflowStage, and ids match
				const sourceNode = canvas.getFigure(element.sourceNode);
				t.setSource(sourceNode.getPort(element.sourcePort));
			}
			else {	// use the 'from_stage_id' value, find that WorkflowStage and use a default port on it
				const sourceNode = canvas.getFigure(element.attr.from_stage_id);
				if (!sourceNode) {   // something has gone badly wrong
					if (jdebug) {
						console.log("Can't find source node for id " + element.attr.from_stage_id);
						console.log(json);
						return;
					}
				} 
				t.setSource(sourceNode.getPort("hybrid4"));
			}
			
			// handling the target node - similar to source node, but without the complexity of coming from any stage
			if (element.targetNode != undefined  && element.targetNode == element.attr.to_stage_id) {
				const targetNode = canvas.getFigure(element.targetNode);
				t.setTarget(targetNode.getPort(element.targetPort));
			}
			else {
				const targetNode = canvas.getFigure(element.attr.to_stage_id);
				if (!targetNode) {  // something has gone badly wrong
					if (jdebug) {
						console.log("Can't find target node for id " + element.attr.to_stage_id);
						console.log(json);
						return;
					}
				}
				t.setTarget(targetNode.getPort("hybrid6"));
			}
			canvas.add(t);
			
		} else if (element.type == "DefaultTransition") {
			if (!startnodeCreated) {	// we need a StartNode to attach this transition onto
				startnode = new StartNode();
				canvas.add(startnode);
				startnodeCreated = true;
			}
			var t = new DefaultTransition(element.attr);
			t.setSource(startnode.getOutputPort(0));
			if (element.targetNode == defaultStageId) {	// default stage is the same as when graph was last saved
				const targetNode = canvas.getFigure(element.targetNode);
				if (targetNode != undefined) {
					t.setTarget(targetNode.getPort(element.targetPort));
					canvas.add(t);
				} else {   // something has gone badly wrong
					if (jdebug) {
						console.log("Can't find default target node for id " + element.targetNode);
						console.log(json);
						return;
					}
				}
			} else if (defaultStageId != 0) { // find the shape associated with the new default stage, and connect to a default port on it
				const targetNode = canvas.getFigure(defaultStageId);
				if (targetNode != undefined) {
					t.setTarget(targetNode.getPort("hybrid5"));
					canvas.add(t);
				} else { 	// something has gone badly wrong
					if (jdebug) {
						console.log("Can't find target node for default stage " + defaultStageId);
						console.log(json);
						return;
					}
				}
			}
			defaultCreated = true;
		}
	});
	
	// ensure there's a StartNode in the graph
	if (!startnodeCreated) {
		startnode = new StartNode();
		canvas.add(startnode);
		startnodeCreated = true;
	}
	
	// ensure there's a DefaultTransition in the graph
	if (!defaultCreated) {
		if (defaultStageId != 0) {
			var t = new DefaultTransition();
			t.setSource(startnode.getOutputPort(0));
			var targetNode = canvas.getFigure(defaultStageId);
			if (targetNode != undefined) {
				t.setTarget(targetNode.getPort("hybrid5"));
				canvas.add(t);
			} else { 	// something has gone badly wrong
				if (jdebug) {
					console.log("Can't find target node for default stage " + defaultStageId);
					console.log(json);
				}
			}
		}
	}
}

/*
 * This function is called whenever the user drags a source port to a target port, thus creating a connection
 * We use this to create a new Workflow or Default Transition from the source shape to the target Stage,
 *   and we add an arrow to the connector to indicate the direction of the transition
 */
var createConnection=function(source, target){
	
	// This function is called when the user drags an output port to an input port somewhere else
	// The base draw2d code has been used as the basis for the WorkflowDragConnectionCreatePolicy which
	// calls this createConnection function, but the base code changed so that the source and target nodes are passed
	// In this way we can find out what are the shapes which are involved in the connection.
	// If the source node refers to the StartNode then this is the default transition,
	// otherwise we just create an ordinary Workflow Transition
	
	if (source.parent instanceof StartNode)
	{
		// create a "default" transition
		var conn= new DefaultTransition({});
	}
	else
	{
		// create a new Workflow Transition
		var conn= new WorkflowTransition({userData:{published:"1", description:"", actionPublishing:""}});
	}
	
    // these functions change the appearance of the connecting line when you reach the target port
    conn.on("dragEnter", function(emitter, event){
      conn.attr({
        outlineStroke:2
      });
    });
    conn.on("dragLeave", function(emitter, event){
      conn.attr({
        outlineStroke:0
      });
    });

    return conn;
};

/*
 * Function called whenever the user selects a figure on the graph by clicking on it
 * It creates the properties elements associated with the figure in the properties pane,
 * populating the elements with the current data values.
 */
function handleSelect(emitter,event) {
	if (event.figure!==null) {
		var propertiesPane = document.getElementById("properties");
		if (event.figure instanceof WorkflowStage) {
			const title = "<p>Workflow Stage: " + event.figure.getTitle() + "<br><br>";
			const status = createStageStatus(event.figure);
			const description = createStageDescription(event.figure);
			propertiesPane.innerHTML = title + status + description;
		} else if (event.figure instanceof WorkflowTransition) {
			const title = "<p>Workflow Transition: " + event.figure.getTitle() + "<br><br>";
			const status = createTransitionStatus(event.figure);
			const description = createTransitionDescription(event.figure);
			const actionPublishing = createTransitionActionPublishing(event.figure);
			propertiesPane.innerHTML = title + status + description + actionPublishing;
		} else {
			document.getElementById("properties").innerHTML = "";
		}
    }
    else {
		document.getElementById("properties").innerHTML = "";
    }
}

$(window).on('load', function () {
	
    // create the canvas for the user interaction; hopefully 3000 x 3000 should be big enough
    canvas = new draw2d.Canvas("gfx_container", 3000, 3000);
	
	// we don't allow the user to select multiple items, which would cause difficulties for displaying properties
    canvas.installEditPolicy(new draw2d.policy.canvas.SingleSelectionPolicy());

	// allow the user to drag from an input port to an output port - which will result in our createConnection() being called
	canvas.installEditPolicy(  new draw2d.policy.connection.WorkflowDragConnectionCreatePolicy({
        createConnection: createConnection
	})); 
	
	const graphInfo = Joomla.getOptions('graph');
	const defaultStageId = Joomla.getOptions('defaultStageId');
	if (graphInfo) {
		build_graph(graphInfo, defaultStageId);
	}
	else 
	{
		// create a Start Node which the user can associate with the initial transition
		const start = new StartNode();
		canvas.add(start);

		// create an Any Stage
		const anystage = new AnyStage({x: 600, y: 10});
		canvas.add(anystage);
	}
	
	// Display the title of the workflow in the properties panel
	const title = Joomla.getOptions('title');
	document.getElementById('workflowTitle').innerHTML = title;
	
	// get the ports to appear only when you bring the mouse close to them
	canvas.installEditPolicy(new draw2d.policy.canvas.CoronaDecorationPolicy());
	
	// set up listener on "select" events, so that the properties of shapes can be shown in the properties panel
	canvas.on("select", handleSelect);
	
	// set up debug diagnostics
	jdebug = Joomla.getOptions('jdebug');
	if (jdebug) {
		var diagnostics = document.createElement('div');
		diagnostics.className = "btn-group";
		diagnostics.innerHTML = '<button type="button" class="btn" onclick="diagnostics()">' + 
				'<span class="icon-cancel"></span>diagnostics</button>';
		document.getElementById("form-buttons").appendChild(diagnostics);
	}
});