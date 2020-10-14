// The hierarchical class structure in draw2d is based on John Resig JS Class implementation. 
// See https://johnresig.com/blog/simple-javascript-inheritance/ (or search for john resig simple JavaScript class inheritance)

WorkflowTransition = draw2d.Connection.extend({
    NAME: "WorkflowTransition",

	init : function(attr, setter, getter)
	{
		// add a new property of this class - title, with default value
		this.title = "New Transition";
		this._super(attr,
			jQuery.extend({},{title: this.setTitle}, setter),
			jQuery.extend({},{title: this.getTitle}, getter));

		// create a vertical layout which will hold both the label for the transition title, 
		// and the label which displays the item publishing state after this transition is executed
		this.layout = new draw2d.shape.layout.VerticalLayout();
		
		this.label = new draw2d.shape.basic.Label({
		  text:this.title,
		  color:"#0d0d0d",
		  fontColor:"#0d0d0d",
		  bgColor:"#f0f0f0"
		});
		
		this.actionPublishingLabel = new draw2d.shape.basic.Label({
		  text:"(no change)",
		  color:"#0d0d0d",
		  fontColor:"#0d0d0d",
		  bgColor:"#f0f0f0"
		});
		
		this.layout.add(this.label);
		this.layout.add(this.actionPublishingLabel);

		// add the 2 labels in the layout to the connection with a position locator
		this.add(this.layout, new draw2d.layout.locator.PolylineMidpointLocator());
		
		// add an arrow to show the direction of the transition
		this.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());
		
		// set the router as a direct line between the ports (rather than a polyline)
		this.setRouter(new draw2d.layout.connection.DirectRouter());
		
		// allow the user to change the text of the label which holds the transition title
		this.label.installEditor(new draw2d.ui.LabelInplaceEditor());
		
		if (this.userData != undefined) {
			if (this.userData.published == "1") {  
				this.setDashArray("");
				this.setColor("#00a8f0");
			}
			else {
				this.setDashArray(".");
				this.setColor("#aaaaaa");
			}
			if (this.userData.actionPublishing != undefined) {
				switch(this.userData.actionPublishing) {
					case "0": this.actionPublishingLabel.setText("to Unpublished"); break;
					case "1": this.actionPublishingLabel.setText("to Published"); break;
					case "2": this.actionPublishingLabel.setText("to Archived"); break;
					case "-2": this.actionPublishingLabel.setText("to Trashed"); break;
					default: this.actionPublishingLabel.setText("(no change)");
				}
			}
		}
		
		// when the text is changed, set this as the Transition title
		// This will cause the on change event to be fired for the Transition.
		// This will in turn cause the Transition to be selected, and the handleSelect function which gets that notification
		// will update the properties pane with the new title.
		// 2 getParent() calls because the vertical layout is the immediate parent
		this.label.on("change:text", function(emitter, newtext){
			emitter.getParent().getParent().setTitle(newtext.value);
		});
		
		// when the Transition is deleted we clear the properties panel (as we don't get a select event in this case)
		this.on("removed", (emitter, event)=>{
			document.getElementById("properties").innerHTML = "";
		});
		
		// the "on" method is called when a property of the node is changed
		// This happens for the node's userData property whenever user changes a property in the property pane, or when the undo/redo changes one
		// We then set this object as selected because this generates a select event, which forces the update of the properties in the properties pane
		// We also set the connector line to match the status and set the publishing action state
		// (The emitter is this node, the event is the node property which has been set)
		this.on("change", (emitter, event)=>{
			if (event == "userData") {
				let canvas = emitter.getCanvas();
				canvas.setCurrentSelection(emitter);
				const userdata = emitter.getUserData();
				if (userdata != undefined) {
					if (userdata.published == "1") {  
						this.setDashArray("");
						this.setColor("#00a8f0");
					}
					else {
						this.setDashArray(".");
						this.setColor("#aaaaaa");
					}
					switch(userdata.actionPublishing) {
						case "0": this.actionPublishingLabel.setText("to Unpublished"); break;
						case "1": this.actionPublishingLabel.setText("to Published"); break;
						case "2": this.actionPublishingLabel.setText("to Archived"); break;
						case "-2": this.actionPublishingLabel.setText("to Trashed"); break;
						default: this.actionPublishingLabel.setText("(no change)");
					}
				}
			} else if (event == "title") {
				let canvas = emitter.getCanvas();
				canvas.setCurrentSelection(emitter);
			}
		});
	},
	
	setTitle: function(newTitle)
	{
		this.title = newTitle;
		// usually this sort of thing triggers a repaint, but we don't need it (currently!)
		//this.repaint();
		this.fireEvent("change:title", {value: this.title});
		return this;
	},
	
	getTitle: function()
	{
		return this.title;
	},
	
	updateUserData : function(updatedProperty)
	{
		const currentUserdata = this.getUserData();
		const newUserdata = {...currentUserdata, ...updatedProperty};
		const command = new draw2d.command.CommandAttr(this, {"userData": newUserdata});
		canvas.getCommandStack().execute(command);
	}

});