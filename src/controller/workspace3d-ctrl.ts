import {Controller, HTML} from "./controller.js";
import {Scene3D} from "../graphics/3d/scene3d.js";
import {gl} from "../index.js";
import {Camera3D} from "../graphics/3d/camera3d";

const keys: Record<string, boolean> = {};

export class Workspace3DCtrl extends Controller {

    @HTML<HTMLCanvasElement>("mainCanvas", HTMLCanvasElement)
    private canvas!: HTMLCanvasElement;



    constructor() {
        super();

        const scene = new Scene3D(gl);
        const canvas = this.canvas;
        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            const sidebar = document.getElementById("sidebar")!;
            canvas.style.width = rect.width + "px";
            canvas.style.height = rect.height + "px";
            scene.resize(canvas.width, canvas.height);
        }



        window.addEventListener("keydown", (e) => {
            keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener("keyup", (e) => {
            keys[e.key.toLowerCase()] = false;
        });

        resizeCanvas();

        (function frame() {
            updateCamera(scene.camera, 1 / 60);
            scene.render();
            requestAnimationFrame(frame);
        })();

        let isPanning = false;
        let lastX = 0;
        let lastY = 0;

        canvas.addEventListener("pointerdown", (e: PointerEvent) => {
            // Only start panning on left mouse / primary touch
            if (e.button !== 0) return;

            isPanning = true;
            lastX = e.clientX;
            lastY = e.clientY;

            canvas.setPointerCapture(e.pointerId);
        });

        canvas.addEventListener("pointermove", (e: PointerEvent) => {
            if (!isPanning) return;

            scene.camera.setPitch(scene.camera.getPitch() - (e.clientY - lastY) * 0.01);
            scene.camera.setYaw(scene.camera.getYaw() - (e.clientX - lastX) * 0.01);

            lastX = e.clientX;
            lastY = e.clientY;
        });

        canvas.addEventListener("pointerup", (e: PointerEvent) => {
            isPanning = false;
            canvas.releasePointerCapture(e.pointerId);
        });

        window.addEventListener("resize", resizeCanvas);
    }
}


function updateCamera(camera: Camera3D, deltaTime: number) {
    let speed = 5.0; // units per second

    const forward = camera.getForward();
    const right = camera.getRight();

    let moveX = 0;
    let moveZ = 0;
    let moveUp = 0;

    if (keys["w"]) moveZ += 1;
    if (keys["s"]) moveZ -= 1;
    if (keys["d"]) moveX += 1;
    if (keys["a"]) moveX -= 1;
    if (keys["e"]) moveUp += 1;
    if (keys["q"]) moveUp -= 1;

    if (keys["shift"]) speed *= 2.0;

    const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (length > 0) {
        moveX /= length;
        moveZ /= length;
    }

    const velocity = speed * deltaTime;

    camera.position.x += (forward.x * moveZ + right.x * moveX) * velocity;
    camera.position.y += moveUp * velocity;
    camera.position.z += (forward.z * moveZ + right.z * moveX) * velocity;
}