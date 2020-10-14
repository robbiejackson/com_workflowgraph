// The hierarchical class structure in draw2d is based on John Resig JS Class implementation. 
// See https://johnresig.com/blog/simple-javascript-inheritance/ (or search for john resig simple JavaScript class inheritance)

var StartNode = draw2d.shape.basic.Circle.extend({

    NAME: "StartNode", 

    init : function( attr, setter, getter)
    {
        this._super( jQuery.extend({x:50, y:10, width:50, bgColor:"#2a69b8", color:"#1B1B1B"}, attr), setter, getter);

		// create an output port - you can't have a transition TO the Start Node
        var output= this.createPort("output");
		
		// set it so that the connector to this Start Node goes to the centre 
		var anchor = new draw2d.layout.anchor.ShortesPathConnectionAnchor(this);
		output.setConnectionAnchor(anchor);
		
		// set it so that when the port is connected via a transition then it's not shown
		// we don't want to allow 2 different transitions as the initial transition
		var show=function(){this.setVisible(true);};
        var hide=function(){this.setVisible(false);};
        output.on("connect",hide,output);
        output.on("disconnect",show,output);
		
		// add a label, and position it in the middle
		this.label = new draw2d.shape.basic.Label({text:"Start", stroke:0, fontColor:"#ffffff"});
        this.add(this.label, new draw2d.layout.locator.CenterLocator(this));
		
		// we don't allow the user to select this, so that it can't be deleted
		this.setSelectable(false);
    }
});
