var FontSizer = Class.create({
    initialize: function(selector, options) {        
        this.options = Object.extend(Object.extend({ }, FontSizer.DefaultOptions), options || { });
        
        this.range = 0;
        this.selector = selector;
        this.setupButtons(this.selector);
        
        switch (this.options.trigger) {
            case "onload":
                this.load(this.selector);
                break;
        }
    },
    
    load: function(selector) {
        if (this.loaded) return;
        this.loaded = true;
        
        this.elements = [];
        this.hidden = [];
        this.excluded = $$(this.options.exclude + ", ." + this.options.buttonsHolderClass);
        
        $$(selector).each(function(element) {
            this.addChild(element);
        }.bind(this));
        
        this.excluded = this.excluded.uniq();
        
        this.setup();
        this.update(0);
    },
    
    setupButtons: function(selector) {
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
            
            var elements = $$(selector);
            if (elements.length != 0) elements[0].insert({ top: buttonHolder });
        }
        
        this.buttons.shrink.classNames().add(this.options.disabledClass);
        
        for (var buttonType in this.buttons) {
            this.buttons[buttonType].observe("click", this[buttonType].bindAsEventListener(this));
        }
    },
    
    addChild: function(element, exclude) {
        if (element == null) return;
        
        if (!exclude) {
            exclude = this.excluded.indexOf(element) != -1;
        }
        
        if (exclude) this.excluded.push(element);
        
        this.elements.push(element);
        if (element.style.display == "none") {
            this.hidden.push(element);
            element.style.display = "block";
        }
        
        element.childElements().each(function(el) {
           this.addChild(el, exclude); 
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
        if (!this.loaded) this.load(this.selector);
        
        this.range += amount;
        
        this.buttons.shrink.classNames().remove(this.options.disabledClass);
        this.buttons.grow.classNames().remove(this.options.disabledClass);
            
        if (this.range < -this.options.range[0]) {
            this.buttons.shrink.classNames().add(this.options.disabledClass);
            this.range = -this.options.range[0];
        }
        else if (this.range > this.options.range[1]) {
            this.buttons.grow.classNames().add(this.options.disabledClass);
            this.range = this.options.range[1];
        }
            
        this.elements.each(function(element) {
            var index = this.elements.indexOf(element);
            
            var oldSize = parseInt(element.getStyle("fontSize")) ;
            var size = oldSize + amount;
            
            if (this.range <= -this.options.range[0]) {
                size = smallestSize;
            }
            
            if (this.range >= this.options.range[1]) {
                size = biggestSize;
            }
            
            var exclude = (this.excluded.indexOf(element) != -1);
            if (exclude == true) size = oldSize;
            
            var smallestSize = this.originalSizes[index] + this.options.range[0];
            var biggestSize = this.originalSizes[index] + this.options.range[1];
           
            element.style.fontSize = size + "px";
            
            if (oldSize != size || exclude) {
                var lineHeight = parseInt(size * this.lineHeightProportions[index]);
                if (!isNaN(lineHeight)) element.style.lineHeight = lineHeight + "px";
            }
        }.bind(this));
        
        this.options.onResize();
    }
});

FontSizer.DefaultOptions = {
    trigger: "onclick",                 // accepts either onload or onclick
    exclude: "",                        // selector that selects the elements to exclude from resizing
    buttonsHolderClass: "fontsizer",    // class added to the font sizer buttons if none is provided
    incrementButton: null,              // specify if you don't want the generic buttons
    decrementButton: null,              // specify if you don't want the generic buttons
    disabledClass: "disabled",          // class applied to buttons if limit is reached
    incrementAmount: 1,                 // amount to increase by
    decrementAmount: 1,                 // amount to decrease by
    range: [0, 5],                      // min and max size of the font (relative to the starting size)
    incrementText: "+<sub>A</sub>A",
    decrementText: "&minus;A<sub>A</sub>",
    onResize: function () {}
};