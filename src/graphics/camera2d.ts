export interface Camera {

}

export class Camera2D implements Camera {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public zoom: number;

    public constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.zoom = 3.0;
    }

    public screenToWorld(x: number, y: number): {x: number, y: number} {
        const uvX = (x / this.width) * 2 - 1;
        const uvY = -((y / this.height) * 2 - 1);
        const aspect = this.width / this.height;
        return { x: uvX * aspect * this.zoom + this.x, y: uvY * this.zoom + this.y };
    }

    public worldToScreen(worldX: number, worldY: number): {x: number, y: number} {
        const aspect = this.width / this.height;
        const uvX = (worldX - this.x) / (aspect * this.zoom);
        const uvY = (worldY - this.y) / this.zoom;
        return { x: (uvX * 0.5 + 0.5) * this.width, y: (1.0 - (uvY * 0.5 + 0.5)) * this.height };
    }
}