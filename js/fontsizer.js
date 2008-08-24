var FontSizer = Class.create({
    initialize: function(shrinkButton, growButton, selector, options) {
        this.buttons = { shrink: $(shrinkButton), grow: $(growButton) };
        
        this.elements = [];
        this.hidden = [];
        $$(selector).each(function(element) {
            this.addChild(element);
        }.bind(this));
        
        this.options = Object.extend(Object.extend({ }, FontSizer.DefaultOptions), options || { });
        
        this.setup();
    },
    
    addChild: function(element) {
        if (element == null) return;
        
        this.elements.push(element);
        if (element.style.display == "none") {
            this.hidden.push(element);
            element.style.display = "block";
        }
        
        element.childElements().each(function(el) {
           this.addChild(el); 
        }.bind(this));
    },
    
    setup: function() {
        this.lineHeightProportions = [];
        this.originalSizes = [];
        
        this.elements.each(function(element) {
            var size = parseInt(element.getStyle("fontSize"));
            var lineHeight = parseInt(element.getStyle("lineHeight"));
            
            this.lineHeightProportions.push(lineHeight / size);
            this.originalSizes.push(size);
            
            element.style.fontSize = size + "px";
        }.bind(this));
        
        this.hidden.each(function(element) {
           element.style.display = "none"; 
        });
        
        for (var buttonType in this.buttons) {
            this.buttons[buttonType].observe("click", this[buttonType].bindAsEventListener(this));
        }
    },
    
    shrink: function(event) {
        this.update(-this.options.decrementAmount);
        event.stop();
    },
    
    grow: function(event) {
        this.update(this.options.incrementAmount);
        event.stop();        
    },
    
    update: function(amount) {
        this.elements.each(function(element) {
            var index = this.elements.indexOf(element);
            
            var oldSize = parseInt(element.getStyle("fontSize")) ;
            var size = oldSize + amount;
            
            var smallestSize = this.originalSizes[index] + this.options.range[0];
            var biggestSize = this.originalSizes[index] + this.options.range[1];
            
            if (size < smallestSize) size = smallestSize;
            if (size > biggestSize) size = biggestSize;
           
            element.style.fontSize = size + "px";
            
            if (oldSize != size) {
                var lineHeight = parseInt(size * this.lineHeightProportions[index]);
                if (!isNaN(lineHeight)) element.style.lineHeight = lineHeight + "px";
            }
        }.bind(this));
    }
});

FontSizer.DefaultOptions = {
    incrementAmount: 1,   // amount to increase by
    decrementAmount: 1,   // amoutn to decrease by
    range: [-5, 5]        // min and max size of the font (relative to the starting size)
};