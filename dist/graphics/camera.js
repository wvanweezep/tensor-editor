export class Camera3D {
    constructor(position, width, height, viewMod) {
        this.forward = { x: 0, y: 0, z: 1 };
        this.right = { x: 1, y: 0, z: 0 };
        this.up = { x: 0, y: 1, z: 0 };
        this.yaw = 0;
        this.pitch = 0;
        this.dirty = false;
        this.position = position;
        this.width = width;
        this.height = height;
        this.viewMod = viewMod;
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
        this.yaw = yaw % (2 * Math.PI);
        this.dirty = true;
    }
    getPitch() {
        return this.pitch;
    }
    setPitch(pitch) {
        this.pitch = Math.min(89.9 * (Math.PI / 180.0), Math.max(-89.9 * (Math.PI / 180.0), pitch));
        this.dirty = true;
    }
    applyUniforms(gl, shader) {
        gl.uniform3f(shader.getUniformLoc("u_camera.position"), this.position.x, this.position.y, this.position.z);
        gl.uniform3f(shader.getUniformLoc("u_camera.forward"), this.forward.x, this.forward.y, this.forward.z);
        gl.uniform3f(shader.getUniformLoc("u_camera.right"), this.right.x, this.right.y, this.right.z);
        gl.uniform3f(shader.getUniformLoc("u_camera.up"), this.up.x, this.up.y, this.up.z);
        gl.uniform1f(shader.getUniformLoc("u_camera.viewMod"), this.viewMod);
        gl.uniform2f(shader.getUniformLoc("u_resolution"), this.width, this.height);
    }
}
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
    applyUniforms(gl, shader) {
        gl.uniform4f(shader.getUniformLoc("u_camera"), this.x, this.y, this.width, this.height);
        gl.uniform1f(shader.getUniformLoc("u_zoom"), this.zoom);
    }
}
