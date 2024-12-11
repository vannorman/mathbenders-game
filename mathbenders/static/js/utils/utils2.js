Utils2 = {
    getFlatObjectValues(obj) { 
        return Object.values(obj).flatMap(val => (typeof val === 'object' && val.getFileUrl == undefined) ? Utils2.getFlatObjectValues(val) : val); 
        // flatten our assets so that individual assets inside "assets.sounds" are loaded in serial. dislike recursive hacky check for "is really an asset" by has "url" prop vs being a nested object.
        },
 
}
