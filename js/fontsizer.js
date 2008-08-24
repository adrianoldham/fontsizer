var FontSizer = Class.create({
    initialize: function(selector, options) {        
        this.elements = [];
        this.hidden = [];
        $$(selector).each(function(element) {
            this.addChild(element);
        }.bind(this));
        
        this.options = Object.extend(Object.extend({ }, FontSizer.DefaultOptions), options || { });
        
        this.setup();
        this.update(0);
    },
    
    setupButtons: function() {
        this.buttons = { shrink: $(this.options.decrementButton), grow: $(this.options.incrementButton) };
        
        if (this.buttons.shrink == null || this.buttons.grow == null) {
            var buttonHolder = new Element("p", { "class": this.options.buttonsHolderClass });
            buttonHolder.insert("Text size: ");
            
            this.buttons.shrink = new Element("a", { title: "AccessKey = <", accesskey: "<", href: "#"});
            this.buttons.shrink.insert(this.options.decrementText);
            
            buttonHolder.insert(this.buttons.shrink);
            buttonHolder.insert(" | ");
            
            this.buttons.grow = new Element("a", { title: "AccessKey = >", accesskey: ">", href: "#"});
            this.buttons.grow.insert(this.options.incrementText);
            
            buttonHolder.insert(this.buttons.grow);
            
            if (this.elements.length != 0) this.elements[0].insert({ before: buttonHolder });
        }
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
        this.setupButtons();
        
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
            
            this.buttons.shrink.classNames().remove(this.options.disabledClass);
            this.buttons.grow.classNames().remove(this.options.disabledClass);
            
            if (size <= smallestSize) {
                size = smallestSize;
                this.buttons.shrink.classNames().add(this.options.disabledClass);
            }
            
            if (size >= biggestSize) {
                size = biggestSize;
                this.buttons.grow.classNames().add(this.options.disabledClass);
            }
           
            element.style.fontSize = size + "px";
            
            if (oldSize != size) {
                var lineHeight = parseInt(size * this.lineHeightProportions[index]);
                if (!isNaN(lineHeight)) element.style.lineHeight = lineHeight + "px";
            }
        }.bind(this));
    }
});

FontSizer.DefaultOptions = {
    buttonsHolderClass: "fontsizer",
    incrementButton: null,              // specify if you don't want the generic buttons
    decrementButton: null,              // specify if you don't want the generic buttons
    disabledClass: "disabled",          // class applied to buttons if limit is reached
    incrementText: "+<sub>A</sub>A",
    decrementText: "-<sub>A</sub>A",
    incrementAmount: 1,                 // amount to increase by
    decrementAmount: 1,                 // amount to decrease by
    range: [-5, 5]                      // min and max size of the font (relative to the starting size)
};