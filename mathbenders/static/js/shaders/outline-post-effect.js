class OutlineEffect extends pc.PostEffect {
    constructor(graphicsDevice, thickness = 1, color = pc.Color.YELLOW) {
        super(graphicsDevice);

        const fshader = `
            #define THICKNESS ${thickness.toFixed(0)}
            uniform float uWidth;
            uniform float uHeight;
            uniform vec4 uOutlineCol;
            uniform sampler2D uColorBuffer;
            uniform sampler2D uOutlineTex;
            varying vec2 vUv0;
            void main(void) {
                vec2 flippedUv = vec2(vUv0.x, 1.0 - vUv0.y);
                vec4 texel1 = texture2D(uColorBuffer, flippedUv);
                float sample0 = texture2D(uOutlineTex, flippedUv).a;
                float outline = 0.0;
                if (sample0 == 0.0) {
                    for (int x = -THICKNESS; x <= THICKNESS; x++) {
                        for (int y = -THICKNESS; y <= THICKNESS; y++) {
                            float tex = texture2DLod(uOutlineTex, flippedUv + vec2(float(x) / uWidth, float(y) / uHeight), 0.0).a;
                            if (tex > 0.0) {
                                outline = 1.0;
                            }
                        }
                    }
                }
                gl_FragColor = mix(texel1, uOutlineCol, outline * uOutlineCol.a);
            }
        `;

        this.shader = pc.createShaderFromCode(graphicsDevice, pc.PostEffect.quadVertexShader, fshader, 'OutlineShader', {
            aPosition: pc.SEMANTIC_POSITION
        });

        this.color = color;
        this.texture = new pc.Texture(graphicsDevice);
        this.texture.name = 'pe-outline';
        this._colorData = new Float32Array(4);
    }

    render(inputTarget, outputTarget, rect) {
        const device = this.device;
        const scope = device.scope;

        this._colorData[0] = this.color.r;
        this._colorData[1] = this.color.g;
        this._colorData[2] = this.color.b;
        this._colorData[3] = this.color.a;

        scope.resolve('uWidth').setValue(inputTarget.width);
        scope.resolve('uHeight').setValue(inputTarget.height);
        scope.resolve('uOutlineCol').setValue(this._colorData);
        scope.resolve('uColorBuffer').setValue(inputTarget.colorBuffer);
        scope.resolve('uOutlineTex').setValue(this.texture);

        this.drawQuad(outputTarget, this.shader, rect);
    }
}


// --------------- POST EFFECT DEFINITION --------------- //
/**
 * @class
 * @name OutlineEffect
 * @classdesc Applies an outline effect on input render target.
 * @description Creates new instance of the post effect.
 * @augments PostEffect
 * @param {GraphicsDevice} graphicsDevice - The graphics device of the application.
 * @param {number} thickness - The thickness for the outline effect passed here to be used as a constant in shader.
 * @property {Texture} texture The outline texture to use.
 * @property {Color} color The outline color.
 */

