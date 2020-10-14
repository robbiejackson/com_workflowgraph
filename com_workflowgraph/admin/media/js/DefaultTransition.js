// The hierarchical class structure in draw2d is based on John Resig JS Class implementation. 
// See https://johnresig.com/blog/simple-javascript-inheritance/ (or search for john resig simple JavaScript class inheritance)

/*
 * This structure models the default transition which is applied at the start of the workflow
**/

DefaultTransition = draw2d.Connection.extend({
    NAME: "DefaultTransition",

	init : function(attr, setter, getter)
	{
		this._super(attr, setter, getter);
			
		this.label = new draw2d.shape.basic.Label({
		  text:"Default",
		  color:"#0d0d0d",
		  fontColor:"#0d0d0d",
		  bgColor:"#f0f0f0"
		});

		this.add(this.label, new draw2d.layout.locator.ParallelMidpointLocator());
		
		// add an arrow to show the direction
		this.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());
		
		// set the router as a direct line between the ports (rather than a polyline)
		this.setRouter(new draw2d.layout.connection.DirectRouter());
	
	}
});