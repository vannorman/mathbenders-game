PickRandomFromObject = function(obj){ 
    const index = Math.round(Math.random()*(Object.keys(obj).length-1));
    // console.log("pick rand from:"+obj+", index:"+index);
    return obj[Object.keys(obj)[index]];
}

