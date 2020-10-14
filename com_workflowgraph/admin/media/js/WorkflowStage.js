// The hierarchical class structure in draw2d is based on John Resig JS Class implementation. 
// See https://johnresig.com/blog/simple-javascript-inheritance/ (or search for john resig simple JavaScript class inheritance)

WorkflowStage = draw2d.shape.basic.Rectangle.extend({
    NAME: "WorkflowStage",

	init : function(attr, setter, getter)
	{
		// add a new property of this class - title
		this.title = "Double-click me!";
		this._super(jQuery.extend({}, {width:100, height:80, bgColor:"#1f9026",color:"#1B1B1B"}, attr),
			jQuery.extend({},{title: this.setTitle}, setter),
			jQuery.extend({},{title: this.getTitle}, getter));

		// add ports on top and bottom. All are of type "hybrid" allowing bothway connection
		this.createPort("hybrid", new draw2d.layout.locator.XYRelPortLocator(33,0));
		this.createPort("hybrid", new draw2d.layout.locator.XYRelPortLocator(66,0));
		this.createPort("hybrid", new draw2d.layout.locator.XYRelPortLocator(33,100));
		this.createPort("hybrid", new draw2d.layout.locator.XYRelPortLocator(66,100));
		// InputPortLocator is for positioning ports on the left and it spaces them out when you call it multiple times
		this.createPort("hybrid", new draw2d.layout.locator.InputPortLocator());
		this.createPort("hybrid", new draw2d.layout.locator.InputPortLocator());
		// Similarly OutputPortLocator positions ports on the right
		this.createPort("hybrid", new draw2d.layout.locator.OutputPortLocator());
		this.createPort("hybrid", new draw2d.layout.locator.OutputPortLocator());
		
		// add the label in the middle, and install an editor to allow changing it
		this.label = new draw2d.shape.basic.Label({text:this.title, color:"#0d0d0d", fontColor:"#ffffff"});
		this.add(this.label, new draw2d.layout.locator.CenterLocator(this));
		this.label.installEditor(new draw2d.ui.LabelInplaceEditor());
		
		// when the text is changed, set this as the Stage title
		// This will cause the on change event to be fired for the Stage.
		// This will in turn cause the Stage to be selected, and the handleSelect function which gets that notification
		// will update the properties pane with the new title.
		this.label.on("change:text", function(emitter, newtext){
			emitter.getParent().setTitle(newtext.value);
		});
		
		// when the Stage is deleted we clear the properties panel (as we don't get a select event in this case)
		this.on("removed", (emitter, event)=>{
			document.getElementById("properties").innerHTML = "";
		})

		if (this.userData != undefined && this.userData.published == "1") {  
			this.setBackgroundColor("#1f9026");
		}
		else {
			this.setBackgroundColor("#aaaaaa");
		}
		
		// the "on" method is called when a property of the node is changed
		// This happens for the node's userData property whenever user changes a property in the property pane, or when the undo/redo changes one
		// We then set this object as selected because this generates a select event, which forces the update of the properties in the properties pane
		// We also set the stage colour to match the status
		// (The emitter is this node, the event is the node property which has been set)
		this.on("change", (emitter, event)=>{
			if (event == "userData") {
				let canvas = emitter.getCanvas();
				canvas.setCurrentSelection(emitter);
				if (!emitter.getUserData() || emitter.getUserData().published == "1") {  // initially userData is null - a user could "undo" to this
					this.setBackgroundColor("#1f9026");
				}
				else {
					this.setBackgroundColor("#aaaaaa");
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
