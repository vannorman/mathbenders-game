var OnDestroy = pc.createScript('onDestroy');
OnDestroy.attributes.add('onDestroyFn', { type: 'object' });
// Used for pickup detection and fx only

OnDestroy.prototype.initialize = function(){
    this.on('destroy', () => {this.onDestroyFn(this);}, this);
};
