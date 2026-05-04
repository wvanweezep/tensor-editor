import {UBO} from "./ubo.js";
import {Camera2D} from "./camera2d.js";
import {GLRenderer, type Renderer} from "./renderer.js";
import {defaultFrag2DSource, defaultVertSource, Shader} from "./shader.js";
import {gl} from "../index.js";


export class Scene {

    private readonly gl: WebGL2RenderingContext;
    private readonly renderer: Renderer;
    private readonly shader: Shader;

    public readonly camera: Camera2D;
    public readonly objects: UBO;

    public constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.renderer = new GLRenderer(gl);
        this.shader = new Shader(gl, defaultVertSource, defaultFrag2DSource);
        this.camera = new Camera2D(0, 0, 1600, 900);
        this.objects = new UBO(gl, 1000, 8, 0);
        this.objects.bind(this.shader, "Scene");
    }

    private getGridScale() {
        const targetPixels = 300;
        const rawStep = targetPixels * ((2 * this.camera.zoom) / this.camera.height);
        const base = 10 ** Math.floor(Math.log10(rawStep));
        const normalized = rawStep / base;
        if (normalized < 2) return base;
        if (normalized < 5) return base * 2;
        return base * 5;
    }

    public resize(width: number, height: number): void {
        this.gl.viewport(0, 0, width, height);
        this.camera.width = width;
        this.camera.height = height;
    }

    public render(): void {
        this.shader.bind();
        gl.uniform4f(this.shader.getUniformLoc("u_camera"), this.camera.x, this.camera.y,
            this.camera.width, this.camera.height);
        gl.uniform1f(this.shader.getUniformLoc("u_zoom"), this.camera.zoom);
        gl.uniform1f(this.shader.getUniformLoc("u_gridScale"), this.getGridScale());
        this.objects.upload();
        this.renderer.render();
    }

    public destroy(): void {
        this.shader.destroy();
        this.renderer.destroy();
    }
}