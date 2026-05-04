// TODO: Either implement a smarter version (child class) preventing gaps in the data or handle this in the Scene class
// TODO: Better dirty flags (dirtyMin - dirtyMax)
// https://wikis.khronos.org/opengl/Uniform_Buffer_Object
// DATA LAYOUT PROPOSAL
// size: 8 floats -> 2x vec4
// type (0 = Empty, 1 = Point, 2 = Line, 3 = Conic) - tensor data - color
//   1                                                    2-7         8
export class UBO {
    constructor(gl, size, stride, bindingPoint) {
        this.dirty = false;
        this.gl = gl;
        this.bindingPoint = bindingPoint;
        this.stride = stride;
        this.size = size;
        this.data = new Float32Array(size * stride);
        this.handle = gl.createBuffer();
        if (!this.handle)
            throw new Error("Failed to create buffer");
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.handle);
        gl.bufferData(gl.UNIFORM_BUFFER, size * stride * 4, gl.DYNAMIC_DRAW);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, this.handle);
    }
    /**
     * Binds the UBO to a uniform block in the shader.
     * @param shader shader to bind the buffer to
     * @param name identifier of the uniform block
     */
    bind(shader, name) {
        const loc = this.gl.getUniformBlockIndex(shader.program(), name);
        this.gl.uniformBlockBinding(shader.program(), loc, this.bindingPoint);
    }
    /**
     * Retrieves a view of an entry in the UBO. Since the returned array is a view,
     * it should not be modified before making a copy.
     * @param index position of requested entry
     * @returns view of the data array at the provided index
     * @throws Error if the index is out of bounds
     */
    get(index) {
        if (index < 0 || index >= this.size)
            throw new Error(`Index out of bounds for ubo: ${index}`);
        return this.data.subarray(index * this.stride, index * this.stride + this.stride);
    }
    /**
     * Sets the values of an entry in the UBO.
     * @param index position of the entry
     * @param values data to replace the entry with
     * @throws Error if the index is out of bounds, or the length of the data
     * is larger than the stride
     */
    set(index, values) {
        if (index < 0 || index >= this.size)
            throw new Error(`Index out of bounds for ubo: ${index}`);
        if (values.length > this.stride)
            throw new Error(`Expected data of length ${this.stride} or smaller but got ${values.length}`);
        this.data.set(values, index * this.stride);
        this.dirty = true;
    }
    /**
     * Uploads the buffer data to the GPU.
     */
    upload() {
        if (!this.dirty)
            return;
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this.handle);
        this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 0, this.data);
        this.dirty = false;
    }
}
