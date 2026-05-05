export class Camera3D {
    constructor(position, width, height, fov) {
        this.forward = { x: 0, y: 0, z: 1 };
        this.right = { x: 1, y: 0, z: 0 };
        this.up = { x: 0, y: 1, z: 0 };
        this.yaw = 0;
        this.pitch = 0;
        this.dirty = false;
        this.position = position;
        this.width = width;
        this.height = height;
        this.fov = fov;
        this.calculateDirection();
    }
    calculateDirection() {
        // Forward (already correct formula)
        let fx = Math.cos(this.pitch) * Math.sin(this.yaw);
        let fy = Math.sin(this.pitch);
        let fz = Math.cos(this.pitch) * Math.cos(this.yaw);
        // Normalize forward
        const fLen = Math.sqrt(fx * fx + fy * fy + fz * fz);
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
        const rLen = Math.sqrt(rx * rx + ry * ry + rz * rz);
        rx /= rLen;
        ry /= rLen;
        rz /= rLen;
        this.right = { x: rx, y: ry, z: rz };
        // up = cross(right, forward)
        let ux = ry * fz - rz * fy;
        let uy = rz * fx - rx * fz;
        let uz = rx * fy - ry * fx;
        const uLen = Math.sqrt(ux * ux + uy * uy + uz * uz);
        ux /= uLen;
        uy /= uLen;
        uz /= uLen;
        this.up = { x: ux, y: uy, z: uz };
        this.dirty = false;
    }
    getForward() {
        if (this.dirty)
            this.calculateDirection();
        return this.forward;
    }
    getRight() {
        if (this.dirty)
            this.calculateDirection();
        return this.right;
    }
    getUp() {
        if (this.dirty)
            this.calculateDirection();
        return this.up;
    }
    getYaw() {
        return this.yaw;
    }
    setYaw(yaw) {
        this.yaw = yaw;
        this.dirty = true;
    }
    getPitch() {
        return this.pitch;
    }
    setPitch(pitch) {
        this.pitch = pitch;
        this.dirty = true;
    }
}
