export type Vec3 = {
    x: number,
    y: number,
    z: number
};

export class Camera3D {

    public position: Vec3;
    private forward: Vec3 = {x: 0, y: 0, z: 1};
    private right: Vec3 = {x: 1, y: 0, z: 0};
    private up: Vec3 = {x: 0, y: 1, z: 0};

    public width: number;
    public height: number;

    private yaw: number = 0;
    private pitch: number = 0;
    private dirty: boolean = false;
    public fov: number;

    public constructor(position: Vec3, width: number, height: number, fov: number) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.fov = fov;
        this.calculateDirection();
    }

    private calculateDirection(): void {
        // Forward (already correct formula)
        let fx = Math.cos(this.pitch) * Math.sin(this.yaw);
        let fy = Math.sin(this.pitch);
        let fz = Math.cos(this.pitch) * Math.cos(this.yaw);

        // Normalize forward
        const fLen = Math.sqrt(fx*fx + fy*fy + fz*fz);
        fx /= fLen;
        fy /= fLen;
        fz /= fLen;

        this.forward = { x: fx, y: fy, z: fz };

        // World up (constant)
        const wux = 0, wuy = 1, wuz = 0;

        // right = normalize(cross(forward, worldUp))
        let rx = fy * wuz - fz * wuy;
        let ry = fz * wux - fx * wuz;
        let rz = fx * wuy - fy * wux;

        const rLen = Math.sqrt(rx*rx + ry*ry + rz*rz);
        rx /= rLen;
        ry /= rLen;
        rz /= rLen;

        this.right = { x: rx, y: ry, z: rz };

        // up = cross(right, forward)
        let ux = ry * fz - rz * fy;
        let uy = rz * fx - rx * fz;
        let uz = rx * fy - ry * fx;

        const uLen = Math.sqrt(ux*ux + uy*uy + uz*uz);
        ux /= uLen;
        uy /= uLen;
        uz /= uLen;

        this.up = { x: ux, y: uy, z: uz };

        this.dirty = false;
    }

    public getForward(): Vec3 {
        if (this.dirty) this.calculateDirection();
        return this.forward;
    }

    public getRight(): Vec3 {
        if (this.dirty) this.calculateDirection();
        return this.right;
    }

    public getUp(): Vec3 {
        if (this.dirty) this.calculateDirection();
        return this.up;
    }

    public getYaw(): number {
        return this.yaw;
    }

    public setYaw(yaw: number) {
        this.yaw = yaw;
        this.dirty = true;
    }

    public getPitch(): number {
        return this.pitch;
    }

    public setPitch(pitch: number) {
        this.pitch = pitch;
        this.dirty = true;
    }
}