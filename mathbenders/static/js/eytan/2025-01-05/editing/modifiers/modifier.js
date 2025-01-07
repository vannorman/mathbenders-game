export default class Modifier {
    constructor(props) {
        const { prefab } = props;
        this.prefab = prefab;
        // this.icon = props.icon;
        const mouse = pc.app.mouse;
        mouse.on(pc.EVENT_HOVER, this.onHover, this);
        mouse.on(pc.EVENT_HOVER_END, this.onHoverEnd, this);
        mouse.on(pc.EVENT_MOUSEDOWN, this.onSelect, this);
    }

    // Name used as identifier of mode, can also be rendered on screen in a tooltip
    // so user can match a name to the modifier if the icon is not clear
    get name() { return ''; }

    onHover() { console.log('onHover', this.name); }

    onHoverEnd() { console.log('onHoverEnd', this.name); }

    onSelect() { console.log('onSelect', this.name); }

    onClose() { console.log('onClose', this.name); }
}