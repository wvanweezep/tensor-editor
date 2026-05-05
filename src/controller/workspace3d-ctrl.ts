import {Controller, HTML} from "./controller.js";
import {Scene3D} from "../graphics/scene3d.js";
import {gl} from "../index.js";
import {Camera3D} from "../graphics/camera.js";

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

        scene.objects.set(0, new Float32Array([
            1, 0.2, 0, 0,
            0.2, 1, 0.1, 0,
            0, 0.1, 1, 0,
            0, 0, 0, -9,
            1, 0, 0, 1
        ]));

        scene.objects.set(1, new Float32Array([
            1, 0, 0, 0,
            0, -1, 0.3, 0,
            0, 0.3, 1, 0,
            0, 0, 0, -6,
            0, 1, 0, 1
        ]));

        scene.objects.set(2, new Float32Array([
            -1, 0.4, 0, 0,
            0.4, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, -5,
            0, 0, 1, 1
        ]));

        scene.objects.set(3, new Float32Array([
            1, 0, 0.5, 0,
            0, 1, 0, 0,
            0.5, 0, -1, 0,
            0, 0, 0, -7,
            1, 1, 0, 1
        ]));

        scene.objects.set(4, new Float32Array([
            0.5, 0, 0, 0,
            0, 2, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, -8,
            1, 0, 1, 1
        ]));

        scene.objects.set(5, new Float32Array([
            1, -0.3, 0, 0,
            -0.3, 1, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, -3,
            0, 1, 1, 1
        ]));

        scene.objects.set(6, new Float32Array([
            -1, 0, 0, 0,
            0, -1, 0.2, 0,
            0, 0.2, 1, 0,
            0, 0, 0, -4,
            0.5, 0.2, 1, 1
        ]));

        scene.objects.set(7, new Float32Array([
            2, 0, 0, 0,
            0, 0.5, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, -10,
            0.2, 1, 0.3, 1
        ]));

        scene.objects.set(8, new Float32Array([
            1, 0.6, 0, 0,
            0.6, -1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, -6,
            1, 0.5, 0, 1
        ]));

        scene.objects.set(9, new Float32Array([
            0.3, 0, 0.4, 0,
            0, 1, 0, 0,
            0.4, 0, 1, 0,
            0, 0, 0, -5,
            0.3, 0.8, 1, 1
        ]));

        scene.objects.set(10, new Float32Array([
            -1, 0, 0, 0,
            0, 1, -0.5, 0,
            0, -0.5, 1, 0,
            0, 0, 0, -7,
            1, 0.3, 0.3, 1
        ]));

        scene.objects.set(11, new Float32Array([
            1, 0, 0, 0,
            0, 1, 0.7, 0,
            0, 0.7, -1, 0,
            0, 0, 0, -6,
            0.6, 0.2, 0.9, 1
        ]));

        scene.objects.set(12, new Float32Array([
            1.5, 0, 0, 0,
            0, -0.5, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, -9,
            0.9, 0.9, 0.2, 1
        ]));

        scene.objects.set(13, new Float32Array([
            -0.5, 0.2, 0, 0,
            0.2, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, -4,
            0.1, 1, 0.6, 1
        ]));

        scene.objects.set(14, new Float32Array([
            1, 0, 0, 0,
            0, -1, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, -5,
            1, 0.4, 0.7, 1
        ]));
        scene.objects.upload();

        canvas.addEventListener("wheel", (e) => {
            scene.camera.viewMod = Math.max(0.1, Math.min(100000, scene.camera.viewMod * (1.0 + e.deltaY * 0.001)));
        });

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
    let speed = camera.viewMod; // units per second

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