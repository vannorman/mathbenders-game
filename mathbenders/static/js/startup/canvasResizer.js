export default class CanvasResizer {
    res = {x:0,y:0}
    _offset = {x:0,y:0}
    constructor(){}

    ResizeCanvas(){
        // Dynamically change width, height, and Element screencorners values
        const aspectRatio = {w : 8, h:5 }; // duplicated in Constants?
        const winWidth = $(window).innerWidth();
        const winHeight = $(window).innerHeight();
        const minTopOffset = 0;
        var w = winWidth;
        var h = winHeight;
        var offset = {top:0,left:0}//CanvasResizer.canvasOffset; // account for the login stripe above ..
        if (winWidth / winHeight > aspectRatio.w / aspectRatio.h){
            // PIllar version
            // Calculate and set new resolution at aspect ratio constraint.
            let resX = parseInt(winHeight * aspectRatio.w/aspectRatio.h);
            let resY = parseInt(winHeight);
            //this.res.x=resX,res.y=resY;
            // console.log("xy1:"+resX+", "+resY+", winh:"+winHeight);
            pc.app.setCanvasFillMode(pc.FILLMODE_KEEP_ASPECT,resX,resY);
            pc.app.setCanvasResolution(pc.RESOLUTION_AUTO,resX,resY); 
            
            // Bars on left and right. Image is less wide than total page width.
            w = winHeight * aspectRatio.w/aspectRatio.h;
            offset.left = (winWidth - w)/2;
            window.canvasOffset = {left:offset.left,top:0}

        } else {
            // Letterbox
            console.log('lb');
            // Calculate and set new resolution at aspect ratio constraint.
            let resX = parseInt(winWidth);
            let resY = parseInt(winWidth * aspectRatio.h/aspectRatio.w);
            pc.app.setCanvasFillMode(pc.FILLMODE_KEEP_ASPECT,resX,resY);
            pc.app.setCanvasResolution(pc.RESOLUTION_AUTO,resX,resY); 
            // console.log("xy2:"+resX+", "+resY);
            // this.res.x=resX,res.y=resY;
            
            // Bars on top and bottom. Image is as wide as the total page width.
            h = winWidth * aspectRatio.h/aspectRatio.w;
            offset.top = Math.max(minTopOffset,(winHeight-h)/2);
            window.canvasOffset = {left:0,top:offset.top}
        }
        pc.app.resizeCanvas();
        $('#application').css('margin-left',offset.left).css('margin-top',offset.top);
        this.UpdatePlaycanvasEngineCode_ElementScreenCoordsCalculation();
    }
    UpdatePlaycanvasEngineCode_ElementScreenCoordsCalculation(){
        pc.ElementInput.prototype._getTargetElementByCoords = function(camera,x,y){
           var rayA = new pc.Ray();
    		var rayB = new pc.Ray();
    		rayA.end = new pc.Vec3();
    		rayB.end = new pc.Vec3();
           // when y is closer to bottom of screen (closer to zero) it gets more and more offset, at bottom of screen it reads as still being at a high y value. Therefore, we need to subtract between 0 and 1 factor of top margin as a factor of how close mouse y is to bottom of screen.
           y -= parseInt($('#application').css('margin-top'));
           let yPercentCloseToBottom = 1.0 - (pc.app.graphicsDevice.height - y) / pc.app.graphicsDevice.height; // 0 to 1, 1 when y is zero
           let yy = parseInt(yPercentCloseToBottom * parseInt($('#application').css('margin-top')));
           y += yy; // ugh i hate this so much
           x -= parseInt($('#application').css('margin-left'));
           x = parseInt(x*window.innerWidth/$('#application').width());
           var rayScreen = this._calculateRayScreen(x, y, camera, rayA) ? rayA : null;
           var ray3d = this._calculateRay3d(x, y, camera, rayB) ? rayB : null;
           return this._getTargetElement(camera, rayScreen, ray3d);
       }
   }
}



