
// TODO: Add documentation and explanation of terms

export class Shader {

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLProgram;
    private readonly uniforms: Record<string, WebGLUniformLocation>

    public constructor(gl: WebGL2RenderingContext, vertSource: string, fragSource: string) {
        this.gl = gl;

        const vertShader = gl.createShader(gl.VERTEX_SHADER);
        if (!vertShader) throw new Error("Failed to create a new vertex shader");
        gl.shaderSource(vertShader, vertSource);
        gl.compileShader(vertShader);
        if (gl.getShaderParameter(vertShader, gl.COMPILE_STATUS) == false)
            throw new Error("Failed to compile vertex shader: " + gl.getShaderInfoLog(vertShader));

        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (!fragShader) throw new Error("Failed to create a new fragment shader");
        gl.shaderSource(fragShader, fragSource);
        gl.compileShader(fragShader);
        if (gl.getShaderParameter(fragShader, gl.COMPILE_STATUS) == false)
            throw new Error("Failed to compile fragment shader: " + gl.getShaderInfoLog(fragShader));

        this.handle = gl.createProgram();
        gl.attachShader(this.handle, vertShader);
        gl.attachShader(this.handle, fragShader);
        gl.linkProgram(this.handle);
        if (gl.getProgramParameter(this.handle, gl.LINK_STATUS) == false)
            throw new Error("Failed to link program: " + gl.getProgramInfoLog(this.handle));

        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);

        this.uniforms = {};
        const uniformCount = gl.getProgramParameter(this.handle, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniformInfo = gl.getActiveUniform(this.handle, i);
            if (!uniformInfo) continue;
            const name = uniformInfo.name.replace(/\[0\]$/, "");
            const uniformLocation =  gl.getUniformLocation(this.handle, uniformInfo.name);
            if (uniformLocation !== null) this.uniforms[name] = uniformLocation;
        }
    }

    public program(): WebGLProgram {
        return this.handle;
    }

    public getUniformLoc(name: string): WebGLUniformLocation {
        if (!(name in this.uniforms)) throw new Error(
            "Cannot find uniform with the name: " + name);
        return this.uniforms[name];
    }

    public bind(): void {
        this.gl.useProgram(this.handle);
    }

    public destroy(): void {
        this.gl.deleteProgram(this.handle);
    }
}


export const defaultVertSource =
`#version 300 es
layout(location = 0) in vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export const defaultFrag2DSource =
`#version 300 es
precision highp float;

uniform vec4 u_camera;
uniform float u_zoom;
uniform float u_gridScale;

out vec4 fragColor;

struct SceneObject {
    vec4 a;
    vec4 b;
};

layout(std140) uniform Scene {
    SceneObject data[49];
};


float dfPoint(vec3 p, vec3 q) {
    return length(p - q);
}

float dfLine(vec3 p, vec3 l) {
    return dot(l, p) / length(l);
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
            mat3 conic = mat3(
                data[i].a.y, data[i].a.z, data[i].b.x,
                data[i].a.z, data[i].a.w, data[i].b.y,
                data[i].b.x, data[i].b.y, data[i].b.z
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
}`;
