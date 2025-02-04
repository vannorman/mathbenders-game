// Listen for and handle collisions of numbers
// This avoids having a script on every number.

class CollisionManager {

    // Add rigidbody sleep ? (cols.foreach(col=>if col.dist > someDist: col.sleep());
    constructor(){

    }


    static RegisterCollider(entity,callback){
        entity.collision.on('collisionstart', (result) => {
            callback(entity,result);
            CollisionManager.onCollisionStart({entity:entity,result:result});
        });
    }

    static onCollisionStart(args={}){
        const {entity,result} = args;
        console.log('entity:'+entity.name+" cll w:"+result.other.name);

    }
}


