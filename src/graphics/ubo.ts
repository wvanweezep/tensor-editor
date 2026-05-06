import type {Shader} from "./shader.js";


// TODO: Either implement a smarter version (child class) preventing gaps in the data or handle this in the Scene class
// TODO: Better dirty flags (dirtyMin - dirtyMax)
// https://wikis.khronos.org/opengl/Uniform_Buffer_Object


export class UBO {

    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLBuffer;
    private readonly bindingPoint: number;

    public readonly stride: number;
    public readonly size: number;
    protected readonly data: Float32Array;
    protected dirty: boolean = false;

    public constructor(gl: WebGL2RenderingContext, size: number, stride: number, bindingPoint: number) {
        this.gl = gl;
        this.bindingPoint = bindingPoint;
        this.stride = stride;
        this.size = size;
        this.data = new Float32Array(size * stride);

        this.handle = gl.createBuffer();
        if (!this.handle) throw new Error("Failed to create buffer");
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.handle);
        gl.bufferData(gl.UNIFORM_BUFFER, size * stride * 4, gl.DYNAMIC_DRAW);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, this.handle);
    }

    /**
     * Binds the UBO to a uniform block in the shader.
     * @param shader shader to bind the buffer to
     * @param name identifier of the uniform block
     */
    public bind(shader: Shader, name: string): void {
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
    public get(index: number): Float32Array {
        if (index < 0 || index >= this.size) throw new Error(
            `Index out of bounds for ubo: ${index}`);
        return this.data.subarray(index * this.stride, index * this.stride + this.stride);
    }

    /**
     * Sets the values of an entry in the UBO.
     * @param index position of the entry
     * @param values data to replace the entry with
     * @throws Error if the index is out of bounds, or the length of the data
     * is larger than the stride
     */
    public set(index: number, values: Float32Array): void {
        if (index < 0 || index >= this.size) throw new Error(
            `Index out of bounds for ubo: ${index}`);
        if (values.length > this.stride) throw new Error(
            `Expected data of length ${this.stride} or smaller but got ${values.length}`);
        this.data.set(values, index * this.stride);
        this.dirty = true;
    }

    /**
     * Uploads the buffer data to the GPU.
     */
    public upload(): void {
        if (!this.dirty) return;
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this.handle);
        this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 0, this.data);
        this.dirty = false;
    }
}