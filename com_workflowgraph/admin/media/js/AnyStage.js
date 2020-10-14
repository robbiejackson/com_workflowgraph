// The hierarchical class structure in draw2d is based on John Resig JS Class implementation. 
// See https://johnresig.com/blog/simple-javascript-inheritance/ (or search for john resig simple JavaScript class inheritance)

/* 
 * This structure models the situation where you have a Workflow Transition whose source Stage 
 * is set to -1, meaning it can be transitioned from any Stage.
 * This AnyStage structure represents that "any Stage".
 */
AnyStage = draw2d.shape.basic.Oval.extend({
    NAME: "AnyStage",

	init : function(attr, setter, getter)
	{
		this._super(jQuery.extend({bgColor:"#ff0000", color:"#1B1B1B", x: 600, y: 10, width:75, height:50}, attr), setter, getter);

		// create an output port 
        var output= this.createPort("output");
		
		// set it so that the connector from this Stage goes to the centre of the shape
		var anchor = new draw2d.layout.anchor.ShortesPathConnectionAnchor(this);
		output.setConnectionAnchor(anchor);
		
		// add the label in the middle, but don't install an editor to allow changing it
		this.label = new draw2d.shape.basic.Label({text:"Any Stage", color:"#ff0000", fontColor:"#ffffff"});
		this.add(this.label, new draw2d.layout.locator.CenterLocator(this));
		
		// don't allow resizing - causes problems when you're connecting the shape
		this.setResizeable(false);
		
		// when the Stage is deleted we clear the properties panel (as we don't get a select event in this case)
		this.on("removed", (emitter, event)=>{
			document.getElementById("properties").innerHTML = "";
		})
    }

});
