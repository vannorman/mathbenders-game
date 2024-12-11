var ScreenFadeBlack = pc.createScript('screenFadeBlack');

// TODO: Adjust nearClip when we are farther from the portal.

ScreenFadeBlack.attributes.add('fading', { type: 'boolean', default:false }); // portal we are standing in front of


ScreenFadeBlack.prototype.doFadeToBlack = function(){
    this.entity.element.opacity = 1;
    this.fadeOut();
};


ScreenFadeBlack.prototype.fadeOut = function(){
    this.fading = true;
}

ScreenFadeBlack.prototype.update = function(dt){
    if (this.fading) {
        const fadeSpeed = 8;
        this.entity.element.opacity -= fadeSpeed * dt;
        if (this.entity.element.opacity <= 0) this.fading = false;
    }
}

