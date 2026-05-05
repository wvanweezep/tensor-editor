import { GLRenderer } from "../renderer.js";
import { defaultFrag3DSource, defaultVertSource, Shader } from "../shader.js";
import { Camera3D } from "../camera";
export class Scene3D {
    constructor(gl) {
        this.gl = gl;
        this.renderer = new GLRenderer(gl);
        this.shader = new Shader(gl, defaultVertSource, defaultFrag3DSource);
        this.camera = new Camera3D({ x: 0, y: 0, z: -5 }, 1600, 900, 90 * (Math.PI / 180));
    }
    resize(width, height) {
        this.gl.viewport(0, 0, width, height);
        this.camera.width = width;
        this.camera.height = height;
    }
    render() {
        this.shader.bind();
        this.camera.applyUniforms(this.gl, this.shader);
        this.renderer.render();
    }
    destroy() {
        this.shader.destroy();
        this.renderer.destroy();
    }
}
