uniform sampler2D u_texture;

in vec2 v_texture_pos;

// Same fragment shader as for terrain
void main() {
    fragColor = texture(u_texture, v_texture_pos);
}
