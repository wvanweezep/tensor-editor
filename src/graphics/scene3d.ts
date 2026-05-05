import {GLRenderer, Renderer} from "./renderer.js";
import {defaultFrag3DSource, defaultVertSource, Shader} from "./shader.js";
import {Camera3D} from "./camera.js";
import {UBO} from "./ubo.js";


export class Scene3D {

    private readonly gl: WebGL2RenderingContext;
    private readonly renderer: Renderer;
    private readonly shader: Shader;

    public readonly camera: Camera3D;
    public readonly objects: UBO;

    public constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.renderer = new GLRenderer(gl);
        this.shader = new Shader(gl, defaultVertSource, defaultFrag3DSource);
        this.camera = new Camera3D({x: 0, y: 0, z: 0}, 1600, 900, 20.0);
        this.objects = new UBO(gl, 100, 20, 1);
        this.objects.bind(this.shader, "Quadrics");
    }

    private getGridScale() {
        const targetPixels = 300;
        const rawStep = targetPixels * ((2 * this.camera.viewMod) / this.camera.height);
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
        this.camera.applyUniforms(this.gl, this.shader);
        this.gl.uniform1f(this.shader.getUniformLoc("u_gridScale"), this.getGridScale());
        this.gl.uniform1i(this.shader.getUniformLoc("u_sceneSize"), this.objects.size);
        this.objects.upload();
        this.renderer.render();
    }

    public destroy(): void {
        this.shader.destroy();
        this.renderer.destroy();
    }
}