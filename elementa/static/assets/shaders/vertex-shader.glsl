attribute vec2 vertex_position;

varying vec2 uv;

void main() {
    uv = vertex_position * 0.5 + 0.5;
    gl_Position = vec4(vertex_position, 0.0, 1.0);
}


