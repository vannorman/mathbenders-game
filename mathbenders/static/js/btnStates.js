var BtnStates = pc.createScript('btnStates');

BtnStates.attributes.add('hoverAsset', { type:'asset', assetType:'texture' });

BtnStates.attributes.add('activeAsset', {
    type:'asset',
    assetType:'texture'
});

// initialize code called once per entity

BtnStates.prototype.initialize = function(){
    console.log("btn init");
    // Get the original button texture
    this.originalTexture = this.entity.element.textureAsset;

    // Whether the element is currently hovered or not
    this.hovered = false;
    this.pressed = false;

    // mouse events
    this.entity.element.on('mouseenter', this.onEnter, this);
    this.entity.element.on('mousedown', this.onPress, this);
    this.entity.element.on('mouseup', this.onRelease, this);
    this.entity.element.on('mouseleave', this.onLeave, this);

    // touch events
    this.entity.element.on('touchstart', this.onPress, this);
    this.entity.element.on('touchend', this.onRelease, this);
    
    // click events
    
   
};

BtnStates.prototype.fire2 = function(o, thisObj) {
    var scope = thisObj || window;
    if (this.handlers === undefined) return;
    handlers = this.handlers.map((x) => x); // clone the array because a fn may be unsubscribed as a result of firing, and we don't want the list to shrink while in the loop
    for(var i=0; i<handlers.length; i++){
        var fn = handlers[i][0];
       //  console.log("calling fn "+i+" : "+fn);
        scope = handlers[i][1];
        fn.call(scope,o);
     }
    // this.handlers.forEach(function(item) {
    //     fn, context = item;
    //     item.call(scope, o);
    // });
};

// When the cursor enters the element assign the hovered texture
BtnStates.prototype.onEnter = function (event) {
    this.hovered = true;
    event.element.textureAsset = this.hoverAsset;

    // set our cursor to a pointer
    document.body.style.cursor = 'pointer';
};

// When the cursor leaves the element assign the original texture
BtnStates.prototype.onLeave = function (event) {
    this.hovered = false;
    event.element.textureAsset = this.originalTexture;

    // go back to default cursor
    document.body.style.cursor = 'default';
};

// When we press the element assign the active texture
BtnStates.prototype.onPress = function (event) {
    console.log('hi');
    this.pressed = true;
    event.stopPropagation();
    event.element.textureAsset = this.activeAsset;
};



// When we release the element assign the original texture if
// we are not hovering or the hover texture if we are still hovering
BtnStates.prototype.onRelease = function (event) {
    if (this.pressed) {
        this.fire2(this);
    }
    this.pressed = false;
    event.element.textureAsset = this.hovered ? this.hoverAsset : this.originalTexture;
};
