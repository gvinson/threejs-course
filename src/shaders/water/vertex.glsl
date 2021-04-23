uniform float uTime;
uniform float uBigWavesSpeed;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;

// Modify model position to create sin wave
// modelPosition is a vec4;
void main() {
    // Get model position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Create elevation
    float elevation = sin(modelPosition.x * uBigWavesFrequency.x + (uTime * uBigWavesSpeed)) *
                    sin(modelPosition.z * uBigWavesFrequency.y + (uTime * uBigWavesSpeed)) *
                    uBigWavesElevation;

    // Apply elevation
    modelPosition.y += elevation;

    // Position mesh
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}
