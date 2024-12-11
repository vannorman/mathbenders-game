var CanvasFontHelper = pc.createScript('canvasFontHelper');
console.log("hi");
CanvasFontHelper.attributes.add('fontAssets', {
    type: 'json',
    array: true,
    schema: [{
        name: 'name',
        type: 'string',
        description: 'Name for the font face for the canvas font to reference'
    }, {
        name: 'asset',
        type: 'asset',
        assetType: 'binary',
        description: 'Font asset'
    }]
});
CanvasFontHelper.attributes.add('canvasFonts', {
    type: 'json', 
    array: true,
    schema: [{
        name: 'assetName',
        type: 'string',
        default: 'Arial Canvas Font White',
        description: 'If possible, keep this unique to make this easy to find in the assets registry!'
    }, {
        name: 'fontFaces',
        type: 'string',
        default: 'Arial',
        description: 'This has to be written as though it was in a CSS file (https://www.w3schools.com/cssref/pr_font_font-family.asp)'      
    }, {
        name: 'textureSize', 
        type: 'vec2', 
        default: [2048, 2048],
        description: 'The larger the size, the more VRAM is used. More textures are created to fit the glyphs as the canvas font is updated'
    }, {
        name: 'fontSize', 
        type: 'number',
        default: 64,
        description: 'The larger the size, the sharper the glyph but the more space it takes up on the texture'
    }, {
        name: 'color',
        type: 'rgb',
        default: [1, 1, 1]
    }]
});
let canvasFont = null;
// initialize code called once per entity
CanvasFontHelper.prototype.initialize = function() {
    console.log("INIT canvas-font-integration.js");
    var self = this;
    var app = this.app;
    var i;

    this.canvasFonts = []
    this.canvasFonts.push({'assetName':'Dyslexic test','fontFaces':'Dyslexic','textureSize':[2048,2048],'fontSize':64,'color':[1,1,1]});
    

    // Create the canvas font assets
    for (i = 0; i < this.canvasFonts.length; ++i) {
        console.log("Create "+i+":"+this.canvasFonts[i]);
        canvasFont = this.canvasFonts[i];
        canvasFont.asset = new pc.Asset(canvasFont.assetName, 'font', { url:'/static/fonts/opendyslexic3-regular.woff'});
        console.log("canvs font asset:");
        console.log(canvasFont.asset);
        app.assets.add(canvasFont.asset);
        canvasFont.asset.loaded = false;
        this.fontAssets.push({'name':'Dyslexic','asset':canvasFont.asset});
    }

    // Load the font files
    var fontsLoadedCount = 0;
    var fontsFacesAdded = [];
    
    for (i = 0; i < this.fontAssets.length; ++i) {
        // Fontface API not supported in IE 11
        var fontAsset = this.fontAssets[i];
        var font = new FontFace(fontAsset.name, 'url(' + fontAsset.asset.getFileUrl() + ')');  
        font.load().then(function(loadedFace) {
            document.fonts.add(loadedFace);    
            fontsFacesAdded.push(loadedFace);
            fontsLoadedCount += 1;
            
            if (fontsLoadedCount == self.fontAssets.length) {
                self._onFontFacesLoaded();
            }
        }).catch(function(error) {
            console.error(error);
        });
    }
    
    // Remove the fonts and canvas fonts when this script is destroyed
       
    // Cleanup if destroyed
    this.on('destroy', function () {
        var i;
        
        for (i = 0; i < fontsFacesAdded.length; ++i) {
            document.fonts.delete(fontsFacesAdded[i]);
        }
        
        for (i = 0; i < this.canvasFonts.length; ++i) {
            var canvasFont = this.canvasFonts[i];
            canvasFont.asset.resource.destroy();
            app.assets.remove(canvasFont.asset);
        }
    }, this);
};


CanvasFontHelper.prototype._onFontFacesLoaded = function () {
    for (var i = 0; i < this.canvasFonts.length; ++i) {
        var canvasFont = this.canvasFonts[i];
        
        var cf = new pc.CanvasFont(this.app, {
            color: canvasFont.color,
            fontName: canvasFont.fontFaces, // Font has to be added as a font face or exist already on the user's PC
            fontSize: canvasFont.fontSize,
            width: canvasFont.textureSize.x,
            height: canvasFont.textureSize.y,
            getCharScale: function (code) {
                // Finger pointing up and rainbow
                if (code === 0x261D || code === 0x1F308) {
                    return 0.8;
                }

                return -1; // use default scale
            }
        });

        canvasFont.asset.resource = cf;

        // Create the textures first
        cf.createTextures(' ');
        canvasFont.asset.loaded = true;
        canvasFont.asset.fire('load', canvasFont.asset);
    }
};


var ElementCanvasText = pc.createScript('elementCanvasText');
ElementCanvasText.attributes.add('fontAssetName', {type: 'string'});
ElementCanvasText.attributes.add('initialString', {type: 'string'});

// initialize code called once per entity
ElementCanvasText.prototype.postInitialize = function() {
    this.fontAssetName = 'Dyslexic test';
    this.initialString = "Hello World"
    console.log("seek:"+this.fontAssetName);
    this._canvasFontAsset = this.app.assets.find(this.fontAssetName);
    console.log("this canvs font asset:");
    console.log(this._canvasFontAsset);
    if (this._canvasFontAsset == null) {
        console.warn("Can't find font asset: " + this.fontAssetName);
    } else {
        if(this._canvasFontAsset.loaded) {
            this._onCanvasFontAssetLoaded(this._canvasFontAsset);
        } else {
            this._canvasFontAsset.ready(this._onCanvasFontAssetLoaded, this);
        }
    }    
};


ElementCanvasText.prototype._onCanvasFontAssetLoaded = function (asset) {
    this.entity.element.fontAsset = this._canvasFontAsset;
    this.entity.on('updatetext', this._updateText, this);
    this._updateText(this.initialString);
};


ElementCanvasText.prototype._updateText = function (text) {
    if (this._canvasFontAsset.loaded) {
        this._canvasFontAsset.resource.updateTextures(text);
        this.entity.element.text = text;
    } else {
        this.initialString = text;
    }
};

