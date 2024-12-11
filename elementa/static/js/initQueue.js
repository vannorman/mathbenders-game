/* var InitQueue = pc.createScript('initQueue');

InitQueue.prototype.initialize = function(){ 
};

InitQueue.prototype.postInitialize = function() {
   InitializationQueue.RunInitializations();
   InitializationQueue.Finished = true;
};


// Force order of initializations 
// We create an array of initialization functions
// In each script/s initializatoion that we need ordered, we call this "inits" object and add to it via InitalizationQueue.Add(sourceObj,index);
// Then we use InitHook which exists on an entity in the scene to run all these intializtions in order using its postInitialization function
// This means any ORDERED init that uses this InitializationQuee will happen after ALL other "regular" prototype.initializations are run
// Note that we check for undefined in case you assign inits[0] = something and inits[2] something leaving out init[1], it should still work
//  Update: Added lists so that inits will stack if they have the same index,
//  for example if you add 3 inits to index 0 and 4 inits to index 1, all 3 of index 0 will finish first but that is unordered
//  it will skip any empty indices so don't worry about filling them; adding one script to [5] and one script to [6] will work as expected
//   
// var inits = []; // stores the whole source object, not just the "init" fn. 

// ok.. so instantiating things at runtime means this already finished, need to make sure order is observed, again.
// so let's keep track of an initTimeout, which will be set and cleared as needed to make sure new objs get initted properly.
// var initTimeout = null;

var InitializationQueue = {
    Inits : [],
    InitTimeout : null,
    RunInitializations : function (){
        for(var i=0;i<InitializationQueue.Inits.length;i++)
        {
            if (InitializationQueue.Inits[i] !== undefined) {
                for (var j=0;j<InitializationQueue.Inits[i].length;j++){
                    InitializationQueue.Inits[i][j].Init();
                }
            }
        }
        InitializationQueue.Inits = []; // finished once, clear the list so nothing is initted twice.
    },
    Add : function(source,index){
        if (this.Finished === true){
            // Already finished, so set a timer to run inits again in a moment, before adding to the list as normal.

            // console.log(source);
            // Already finished - set up trigger to run again
            clearTimeout (InitializationQueue.InitTimeout);
            InitializationQueue.InitTimeout = setTimeout(function(){InitializationQueue.RunInitializations();},100);

        }
        var i = parseInt(index);
        if (i in InitializationQueue.Inits === false) InitializationQueue.Inits[i] = [];
        InitializationQueue.Inits[i].push(source);
        
    },
    Finished : false
};
*/
