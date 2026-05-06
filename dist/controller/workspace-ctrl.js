var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Controller, HTML } from "./controller.js";
import { Scene } from "../graphics/scene.js";
import { gl } from "../index.js";
export class WorkspaceCtrl extends Controller {
    constructor() {
        super();
        this.tensorMap = new Map();
        const scene = new Scene(gl);
        const canvas = this.canvas;
        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            const sidebar = document.getElementById("sidebar");
            canvas.style.width = rect.width + "px";
            canvas.style.height = rect.height + "px";
            scene.resize(canvas.width, canvas.height);
        }
        resizeCanvas();
        //scene.objects.set(0, new Float32Array([1, 1.0, 0.0, 1.0, 0.0, 0.0, -4.0, 0.0]));
        scene.objects.upload();
        const tensors = this.tensorMap;
        (function frame() {
            let i = 0;
            for (const entry of tensors.values()) {
                scene.objects.set(i++, entry);
            }
            scene.render();
            requestAnimationFrame(frame);
        })();
        canvas.addEventListener("wheel", (e) => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const x = (e.clientX - rect.left) * dpr;
            const y = (e.clientY - rect.top) * dpr;
            const worldBefore = scene.camera.screenToWorld(x, y);
            scene.camera.zoom = Math.max(0.1, Math.min(1000, scene.camera.zoom * (1.0 + e.deltaY * 0.001)));
            const worldAfter = scene.camera.screenToWorld(x, y);
            scene.camera.x += worldBefore.x - worldAfter.x;
            scene.camera.y += worldBefore.y - worldAfter.y;
        });
        let isPanning = false;
        let lastX = 0;
        let lastY = 0;
        canvas.addEventListener("pointerdown", (e) => {
            // Only start panning on left mouse / primary touch
            if (e.button !== 0)
                return;
            isPanning = true;
            lastX = e.clientX;
            lastY = e.clientY;
            canvas.setPointerCapture(e.pointerId);
        });
        canvas.addEventListener("pointermove", (e) => {
            if (!isPanning)
                return;
            const dpr = window.devicePixelRatio || 1;
            const dx = (e.clientX - lastX) * dpr;
            const dy = (e.clientY - lastY) * dpr;
            const aspect = scene.camera.width / scene.camera.height;
            const ndcDX = (dx / scene.camera.width) * 2;
            const ndcDY = -(dy / scene.camera.height) * 2;
            scene.camera.x -= ndcDX * aspect * scene.camera.zoom;
            scene.camera.y -= ndcDY * scene.camera.zoom;
            lastX = e.clientX;
            lastY = e.clientY;
        });
        canvas.addEventListener("pointerup", (e) => {
            isPanning = false;
            canvas.releasePointerCapture(e.pointerId);
        });
        window.addEventListener("resize", resizeCanvas);
    }
}
__decorate([
    HTML("mainCanvas", HTMLCanvasElement)
], WorkspaceCtrl.prototype, "canvas", void 0);
