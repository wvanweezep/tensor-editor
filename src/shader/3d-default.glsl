#version 300 es

// Set the float precision to high for better accuracy
precision highp float;

#define MAX_OBJECTS 10

// Struct for compactly storing a 3D Camera.
struct Camera {
    vec3 position;
    vec3 forward;
    vec3 right;
    vec3 up;
    float viewMod;
};

struct Scene {
    mat4 objects[MAX_OBJECTS];
    int size;
};

// Struct for compactly storing a Ray for marching
struct Ray {
    vec3 origin;
    vec3 direction;
    float t;
};

// Struct for compactly storing a AABB for intersection
struct AABB {
    vec3 min;
    vec3 max;
};

// Struct for compactly storing an interval
struct Interval {
    float min;
    float max;
};


// Resolution of the target Canvas in pixels
uniform vec2 u_resolution;
// Provided Camera to render the Scene from
uniform Camera u_camera;

// Outgoing computed color of the pixel
out vec4 fragColor;


// Creates the perspective Ray for the corresponding gl_FragCoord and Camera
// interpreting Camera.viewMod as FOV.
// @return Ray from a perspective camera for this pixel
Ray generatePerspectiveRay() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = ((gl_FragCoord.xy + 0.5) / u_resolution) * 2.0 - 1.0;
    float scale = tan(u_camera.viewMod * 0.5);
    vec3 direction = u_camera.forward
    + u_camera.right * scale * uv.x * aspect
    + u_camera.up * scale * uv.y;
    return Ray(u_camera.position, normalize(direction), 0.0);
}

// Creates the orthographic Ray for the corresponding gl_FragCoord and Camera
// interpreting Camera.viewMod as orthographic scale.
// @return Ray from an orthographic camera for this pixel
Ray generateOrthographicRay() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = ((gl_FragCoord.xy + 0.5) / u_resolution) * 2.0 - 1.0;
    vec3 origin = u_camera.position
    + u_camera.right * uv.x * u_camera.viewMod * aspect
    + u_camera.up * uv.y * u_camera.viewMod
    - u_camera.forward * u_camera.viewMod;
    return Ray(origin, normalize(u_camera.forward), 0.0);
}

// Creates a axis-alligned bounding box (AABB) from an origin and half extends.
// @param origin (in)       origin of the bounding box
// @param halfExtends (in)  half the width, height, and depth of the box
// @return AABB centered at the provided origin with the halfExtends applied
AABB generateAABB(vec3 origin, vec3 halfExtends) {
    return AABB(origin - halfExtends, origin + halfExtends);
}

// Creates a Sphere
mat4 generateSphere(vec3 c, float r) {
    return mat4(
    1.0, 0.0, 0.0, -c.x,
    0.0, 1.0, 0.0, -c.y,
    0.0, 0.0, 1.0, -c.z,
    -c.x, -c.y, -c.z, dot(c, c) - r * r
    );
}

// Finds the intersection of a Ray with a axis-alligned bounding box (AABB).
// @param ray (in)          Ray to intersect with the bounding box
// @param box (in)          AABB to check intersection with
// @param interval (out)    t values where the ray enters and exits the bounding box
// @return true if the ray intersects with the bounding box
bool intersectAABB(Ray ray, AABB box, out Interval interval) {
    vec3 t1 = (box.min - ray.origin) / ray.direction;
    vec3 t2 = (box.max - ray.origin) / ray.direction;

    vec3 tMin = min(t1, t2);
    vec3 tMax = max(t1, t2);

    float tEnter = max(max(tMin.x, tMin.y), tMin.z);
    float tExit = min(min(tMax.x, tMax.y), tMax.z);

    if (tExit >= tEnter && tExit >= 0.0) {
        interval = Interval(max(tEnter, 0.0), max(tExit, 0.0));
        return true;
    } return false;
}

// Finds the intersection of a Ray with any Quadric.
// @param ray (in)          Ray to intersect with the Quadric
// @param Q (in)            Quadric to check intersection with
// @param interval (out)    t values where the ray enters and exits the Quadric
// @return true if the ray intersects with the Quadric
bool intersectQuadric(Ray ray, mat4 Q, Interval clip, out Interval interval) {
    vec4 roh = vec4(ray.origin, 1.0);
    vec4 rdh = vec4(ray.direction, 0.0);

    float a = dot(rdh, Q * rdh);
    float b = 2.0 * dot(roh, Q * rdh);
    float c = dot(roh, Q * roh);

    if (abs(a) < 1e-6) {
        if (abs(b) < 1e-6) return false;
        float t = -c / b;
        if (t < 0.0) return false;
        interval = Interval(t, t);
        return true;
    }

    float D = b * b - 4.0 * a * c;
    if (D < 0.0) return false;

    float sqrtD = sqrt(D);
    float t0 = (-b - sqrtD) / (2.0 * a);
    float t1 = (-b + sqrtD) / (2.0 * a);

    if (t0 > t1) { float tmp = t0; t0 = t1; t1 = tmp; }

    if (t1 < max(0.0, clip.min) || t0 > clip.max) return false;

    float start = (t0 < 0.0) ? t1 : t0;

    // collapse to point when fully outside one side
    start = (t0 < clip.min && t1 < clip.max) ? t1 : start;
    float end = (t1 > clip.max && t0 > clip.min) ? t0 : t1;

    interval = Interval(start, end);
    return true;
}


bool intersectScene(Ray ray, Scene scene, Interval clip, out int hitIndex, out Interval hitInterval) {
    bool found = false;

    float tMin = 1e20;
    for (int i = 0; i < scene.size; i++) {
        Interval h;
        if (!intersectQuadric(ray, scene.objects[i], clip, h))
        continue;

        float t = h.min;
        if (t < 0.0) t = h.max;
        if (t < 0.0) continue;

        if (t < clip.min || t > clip.max) continue;

        if (t < tMin) {
            tMin = t;
            hitInterval = h;
            hitIndex = i;
            found = true;
        }
    }
    return found;
}

// Distance function for point to grid distance
float dfGrid(vec2 p, float gridSize) {
    vec2 g = p / gridSize;
    vec2 grid = abs(fract(g - 0.5) - 0.5);
    return min(grid.x, grid.y) * gridSize;
}


vec3 render(Ray ray, mat4 Q, Interval hit, Interval clipping) {
    // Pick nearest valid intersection inside clip range
    float t = hit.min;

    // --- Hit position ---
    vec3 p = ray.origin + ray.direction * t;

    // --- Analytical normal: ∇(pᵀQp) = 2Qp ---
    vec4 ph = vec4(p, 1.0);
    vec3 normal = normalize((Q * ph).xyz);

    // Fix orientation (ensure it faces camera)
    if (dot(normal, ray.direction) > 0.0)
    normal = -normal;

    // --- Lighting ---
    vec3 lightDir = normalize(vec3(1.0, 1.2, 0.8));
    float diff = max(dot(normal, lightDir), 0.0);

    float ambient = 0.25;
    float spec = pow(max(dot(reflect(-lightDir, normal), -ray.direction), 0.0), 16.0);

    vec3 baseColor = vec3(0.9, 0.1, 0.2);

    vec3 color = baseColor * (ambient + 0.75 * diff) + spec * 0.25;

    // --- Grid overlay for spatial readability ---
    float grid = dfGrid(p.xz, 0.5);
    float gridLine = smoothstep(0.02, 0.0, grid);

    color = mix(color, vec3(1.0), gridLine * 0.6);

    // --- Fresnel edge highlight (makes shape readable) ---
    float fresnel = pow(1.0 - abs(dot(normal, -ray.direction)), 3.0);
    color += fresnel * 0.25;
    return color;
}



void main() {
    Ray ray = generateOrthographicRay();
    AABB clippingBox = generateAABB(u_camera.position, vec3(u_camera.viewMod * 0.5));
    mat4 clippingSphere = generateSphere(u_camera.position, u_camera.viewMod * 0.75);

    mat4 quadrics[MAX_OBJECTS];

    quadrics[0] = mat4(
    1,0,0,0,
    0,1,0,0,
    0,0,-1,0,
    0,0,0,-1
    );

    quadrics[1] = mat4(
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,-16.0
    );

    quadrics[2] = mat4 (
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, -1.0
    );

    quadrics[3] = mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, -1.0, 0.0,
    0.0, 0.0, 0.0, 0.0
    );

    quadrics[4] = mat4(
    1.0,  0.0,  0.0,  0.0,
    0.0, -1.0,  0.0,  0.0,
    0.0,  0.0,  0.0, -0.5,
    0.0,  0.0, -0.5,  0.0
    );

    quadrics[5] = mat4(
    1.0, 0.0, 0.0,  0.0,
    0.0, 1.0, 0.0,  0.0,
    0.0, 0.0, 0.0, -1.0,
    0.0, 0.0,-1.0,  0.0
    );

    quadrics[6] = mat4(
    1.0, 0.0,  0.0, 0.0,
    0.0, 1.0,  0.0, 0.0,
    0.0, 0.0, -1.0, 0.0,
    0.0, 0.0,  0.0, 1.0
    );

    quadrics[7] = mat4(
    1.0,  0.4,  0.0,  0.0,
    0.4, -1.0,  0.0,  0.0,
    0.0,  0.0,  0.0, -0.5,
    0.0,  0.0, -0.5,  0.0
    );

    quadrics[8] = mat4(
    1.0,  0.5,  0.0,  0.5,
    0.5,  1.0,  0.5,  0.0,
    0.0,  0.5, -1.0,  0.0,
    0.5,  0.0,  0.0, -1.0
    );

    quadrics[9] = mat4(
    1.0,  0.0, 0.0, 0.0,
    0.0, -1.0, 0.0, 0.0,
    0.0,  0.0, 0.0, 0.0,
    0.0,  0.0, 0.0, 0.0
    );

    Scene scene = Scene(quadrics, 10);

    Interval clippingHit = Interval(0.1, 100.0);
    if (!intersectAABB(ray, clippingBox, clippingHit)) {
        fragColor = vec4(0.05, 0.05, 0.05, 1.0);
        return;
    }

    // --- Quadric intersection ---
    int hitIndex;
    Interval hit;
    bool ok = intersectScene(ray, scene, clippingHit, hitIndex, hit);

    if (!ok) {
        fragColor = vec4(0.1, 0.1, 0.1, 1.0);
        return;
    }

    fragColor = vec4(render(ray, scene.objects[hitIndex], hit, clippingHit), 1.0);
}