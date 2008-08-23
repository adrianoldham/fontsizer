var FontSizer = Class.create({
    initialize: function(shrinkButton, growButton, selector, options) {
        this.buttons = { shrink: $(shrinkButton), grow: $(growButton) };
        this.elements = $$(selector);
        
        this.options = Object.extend(Object.extend({ }, FontSizer.DefaultOptions), options || { });
        
        this.setup();
    },
    
    setup: function() {
        this.lineHeightProportions = [];
        
        this.elements.each(function(element) {
            var size = parseInt(element.getStyle("fontSize"));
            var lineHeight = parseInt(element.getStyle("lineHeight"));
            
            this.lineHeightProportions.push(lineHeight / size);
        }.bind(this));
        
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
            
            var size = parseInt(element.getStyle("fontSize")) + amount;
            var lineHeight = size * this.lineHeightProportions[index];
           
            if (size < this.options.range[0]) size = this.options.range[0];
            if (size > this.options.range[1]) size = this.options.range[1];
           
            element.style.fontSize = size + "px";
            if (!isNaN(lineHeight)) element.style.lineHeight = lineHeight + "px";
        }.bind(this));
    }
});

FontSizer.DefaultOptions = {
    incrementAmount: 1,   // amount to increase by
    decrementAmount: 1,   // amoutn to decrease by
    range: [6, 24]        // min and max size of the font
};