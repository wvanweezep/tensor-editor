import { GLRenderer } from "../renderer.js";
import { defaultFrag3DSource, defaultVertSource, Shader } from "../shader.js";
import { Camera3D } from "./camera3d.js";
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
        const camForward = this.camera.getForward();
        const camRight = this.camera.getRight();
        const camUp = this.camera.getUp();
        this.gl.uniform3f(this.shader.getUniformLoc("u_camera.position"), this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.gl.uniform3f(this.shader.getUniformLoc("u_camera.forward"), camForward.x, camForward.y, camForward.z);
        this.gl.uniform3f(this.shader.getUniformLoc("u_camera.right"), camRight.x, camRight.y, camRight.z);
        this.gl.uniform3f(this.shader.getUniformLoc("u_camera.up"), camUp.x, camUp.y, camUp.z);
        this.gl.uniform1f(this.shader.getUniformLoc("u_camera.viewMod"), 20.0);
        this.gl.uniform2f(this.shader.getUniformLoc("u_resolution"), this.camera.width, this.camera.height);
        this.renderer.render();
    }
    destroy() {
        this.shader.destroy();
        this.renderer.destroy();
    }
}
