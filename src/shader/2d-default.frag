#version 300 es
precision highp float;

uniform vec4 u_camera;
uniform float u_zoom;
uniform float u_gridScale;

out vec4 fragColor;

struct SceneObject {
    vec4 a;
    vec4 b;
    vec4 c;
};

layout(std140) uniform Scene {
    SceneObject data[49];
};


float dfPoint(vec2 p, vec3 q) {
    return abs(dot(vec3(p,1.0), l)) / length(l.xy);
}

float dfLine(vec2 p, vec3 l) {
    return abs(dot(vec3(p, 1.0), l)) / length(l.xy);
}

float sdfConic(vec2 p, mat3 M) {
    vec3 v = vec3(p, 1.0);
    float F = dot(v, M * v);
    vec3 mv = M * v;
    vec2 g = 2.0 * mv.xy;
    return F / (length(g) + 1e-4);
}

float grid(vec2 pos, float size) {
    vec2 g = abs(fract((pos/size) - 0.5) - 0.5) / fwidth(pos/size);
    float line = min(g.x, g.y);
    return 1.0 - min(line, 1.0);
}

float axisLine(float coord) {
    return 1.0 - smoothstep(0.0, fwidth(coord) * 2.0, abs(coord));
}

void main() {
    float aspect = u_camera.z / u_camera.w;
    vec2 uv = (gl_FragCoord.xy / u_camera.zw) * 2.0 - 1.0;
    vec2 pos = uv * vec2(aspect, 1.0) * u_zoom + u_camera.xy;

    float alpha = 0.0;

    for (int i = 0; i < 49; i++) {
        if (data[i].a.x == 1.0) {
            vec3 point = data[i].a.yzw;
            float d = dfPoint(pos, point);
            d = clamp(d, -1.0, 1.0);
            float thickness = 3.0 * fwidth(d);
            float newAlpha = 1.0 - smoothstep(0.0, thickness, abs(d));
            if (newAlpha > alpha) alpha = newAlpha;
        }
        else if (data[i].a.x == 2.0) {
            vec3 line = data[i].a.yzw;
            float d = dfLine(pos, line);
            d = clamp(d, -1.0, 1.0);
            float thickness = 3.0 * fwidth(d);
            float newAlpha = 1.0 - smoothstep(0.0, thickness, abs(d));
            if (newAlpha > alpha) alpha = newAlpha;
        }
        else if (data[i].a.x == 3.0) {
            mat3 conic = mat3(
            data[i].a.y, data[i].a.z, data[i].a.w,
            data[i].b.x, data[i].b.y, data[i].b.z,
            data[i].b.w, data[i].c.x, data[i].c.y
            );

            float d = sdfConic(pos, conic);
            d = clamp(d, -1.0, 1.0);
            float thickness = 3.0 * fwidth(d);
            float newAlpha = 1.0 - smoothstep(0.0, thickness, abs(d));
            if (newAlpha > alpha) alpha = newAlpha;
        }
    }

    float xAxis = axisLine(pos.y);
    float yAxis = axisLine(pos.x);
    vec3 axisColor = vec3(1.0, 0.0, 0.0) * xAxis + vec3(0.0, 1.0, 0.0) * yAxis;

    vec3 sdfColor = vec3(1.0, 1.0, 1.0) * alpha;
    vec3 gridColor = vec3(0.20) * grid(pos, u_gridScale);
    vec3 subGridColor = vec3(0.08) * grid(pos, u_gridScale / 5.0);
    vec3 bgColor = vec3(0.05);

    vec3 color = subGridColor + gridColor + bgColor;
    color = mix(color, axisColor, max(xAxis, yAxis));
    color = mix(color, sdfColor, alpha);

    fragColor = vec4(color, 1.0);
}