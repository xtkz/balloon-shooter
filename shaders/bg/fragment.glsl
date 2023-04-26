precision mediump float;

uniform vec3 uTopColor;
uniform vec3 uBottomColor;

varying vec2 vUV;

void main()
{
    gl_FragColor = vec4(mix(uBottomColor, uTopColor, vUV.y), 1.0);
}