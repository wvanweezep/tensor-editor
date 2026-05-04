export class Camera2D {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.zoom = 3.0;
    }
    screenToWorld(x, y) {
        const uvX = (x / this.width) * 2 - 1;
        const uvY = -((y / this.height) * 2 - 1);
        const aspect = this.width / this.height;
        return { x: uvX * aspect * this.zoom + this.x, y: uvY * this.zoom + this.y };
    }
    worldToScreen(worldX, worldY) {
        const aspect = this.width / this.height;
        const uvX = (worldX - this.x) / (aspect * this.zoom);
        const uvY = (worldY - this.y) / this.zoom;
        return { x: (uvX * 0.5 + 0.5) * this.width, y: (1.0 - (uvY * 0.5 + 0.5)) * this.height };
    }
}
