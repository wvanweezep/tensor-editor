import { UBO } from "./ubo.js";
import { Camera2D } from "./camera.js";
import { GLRenderer } from "./renderer.js";
import { defaultFrag2DSource, defaultVertSource, Shader } from "./shader.js";
import { gl } from "../index.js";
export class Scene {
    constructor(gl) {
        this.gl = gl;
        this.renderer = new GLRenderer(gl);
        this.shader = new Shader(gl, defaultVertSource, defaultFrag2DSource);
        this.camera = new Camera2D(0, 0, 1600, 900);
        this.objects = new UBO(gl, 1000, 8, 0);
        this.objects.bind(this.shader, "Scene");
    }
    getGridScale() {
        const targetPixels = 300;
        const rawStep = targetPixels * ((2 * this.camera.zoom) / this.camera.height);
        const base = 10 ** Math.floor(Math.log10(rawStep));
        const normalized = rawStep / base;
        if (normalized < 2)
            return base;
        if (normalized < 5)
            return base * 2;
        return base * 5;
    }
    resize(width, height) {
        this.gl.viewport(0, 0, width, height);
        this.camera.width = width;
        this.camera.height = height;
    }
    render() {
        this.shader.bind();
        this.camera.applyUniforms(this.gl, this.shader);
        gl.uniform1f(this.shader.getUniformLoc("u_gridScale"), this.getGridScale());
        this.objects.upload();
        this.renderer.render();
    }
    destroy() {
        this.shader.destroy();
        this.renderer.destroy();
    }
}
