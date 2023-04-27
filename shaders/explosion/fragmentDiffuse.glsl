// Disc
float strength = distance(gl_PointCoord, vec2(0.5));
strength = step(0.5, strength);
strength = (1.0 - strength) * opacity;
vec4 diffuseColor = vec4( diffuse, strength );