// TODO: Add documentation and explanation of terms
export class GLRenderer {
    constructor(gl) {
        this.gl = gl;
        // Setup single triangle vao
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }
    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }
    destroy() {
        this.gl.deleteVertexArray(this.vao);
    }
}
