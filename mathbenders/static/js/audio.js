AudioManager = {
    sources : {},
    background : null,
    playBackground(args){
        const { source = null, volume = 1.0 } = args;
        if (this.background){
            this.background.destroy();
        }
        if (source == null) {
            console.log("Audio missing!"+JSON.stringify(source));
            return;
        }
        let aud = new pc.Entity("aud:"+source.name);
        pc.app.root.addChild(aud);
        aud.addComponent('sound');
        aud.sound.positional=false;
        aud.sound.addSlot('instancedSound:'+source.name, { 
            asset:source.id, 
            loop:true,
            autoPlay:true, 
            volume:volume, 
            pitch:1,
        });
        this.background = aud;
    },
    playFxInLoopWithConditions(conditions){
        /*
        if !notStarted
        start;
        audioSource.properties = conditions;
        e.g. if player at or below certain y value set vol to x, if above y value set to x/dist
          */  
    },
    play(args){
        const {
            source = null,
            position = pc.Vec3.ZERO,
            pitch = 1,
            volume = 0.4,
            positional = false,
            loop = false,
            maxDist = 10000,
            refDist = 10,
            } = args;

        if (source == null) {
            console.log("Audio missing!"+JSON.stringify(source));
            return;
        }
        let aud = new pc.Entity("aud:"+source.name);
        pc.app.root.addChild(aud);
        aud.setPosition(position);
        // add sound component
        aud.addComponent('sound');
        aud.sound.positional = positional;
        if (positional) {
            aud.sound.distanceModel = pc.DISTANCE_EXPONENTIAL;
            aud.sound.maxDistance = maxDist;
            aud.sound.refDistance = refDist;
        }
        aud.sound.addSlot('instancedSound:'+source.name, { 
            asset:source.id, 
            loop:loop,
            autoPlay:true, 
            volume:volume, 
            pitch:pitch,
        });
        let g = aud.getGuid();
        this.sources[g] = aud;
        if (!loop){
            setTimeout(function(){
                AudioManager.sources[g].destroy();  
                delete(AudioManager.sources[g])
            }, source.resource.buffer.duration * 1000);
        }
        return aud;
    },
}

