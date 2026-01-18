/**
 * Water simulation fragment shader
 * Implements wave equation physics with mouse/touch input
 * Outputs: pressure, velocity, gradientX, gradientY
 */
export const waterSimulationShader = `
  precision highp float;

  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform int u_frame;
  uniform vec3 u_mouse; // x, y, down
  uniform float u_waveSpeed;
  uniform float u_springStrength;
  uniform float u_velocityDamping;
  uniform float u_pressureDamping;
  uniform float u_rippleSize;
  uniform float u_rippleStrength;

  varying vec2 v_texCoord;

  void main() {
    // Initialize on first frame
    if (u_frame == 0) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec2 fragCoord = v_texCoord * u_resolution;

    // Clamp delta to maintain numerical stability (max ~1.0 is stable)
    float delta = min(u_waveSpeed, 1.0);

    // Sample current state
    float pressure = texture2D(u_texture, v_texCoord).x;
    float pVel = texture2D(u_texture, v_texCoord).y;

    vec2 onePixel = 1.0 / u_resolution;

    // Sample neighboring pixels
    float p_right = texture2D(u_texture, v_texCoord + vec2(onePixel.x, 0.0)).x;
    float p_left = texture2D(u_texture, v_texCoord - vec2(onePixel.x, 0.0)).x;
    float p_up = texture2D(u_texture, v_texCoord + vec2(0.0, onePixel.y)).x;
    float p_down = texture2D(u_texture, v_texCoord - vec2(0.0, onePixel.y)).x;

    // Handle boundary conditions
    if (fragCoord.x <= 0.5) p_left = p_right;
    if (fragCoord.x >= u_resolution.x - 0.5) p_right = p_left;
    if (fragCoord.y <= 0.5) p_down = p_up;
    if (fragCoord.y >= u_resolution.y - 0.5) p_up = p_down;

    // Apply wave equation
    pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
    pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;

    // Update pressure
    pressure += delta * pVel;

    // Spring motion for water-like behavior
    pVel -= u_springStrength * delta * pressure;

    // Apply damping
    pVel *= 1.0 - u_velocityDamping * delta;
    pressure *= u_pressureDamping;

    // Calculate gradients for lighting/distortion
    float gradX = (p_right - p_left) / 2.0;
    float gradY = (p_up - p_down) / 2.0;

    gl_FragColor = vec4(pressure, pVel, gradX, gradY);

    // Add mouse input when dragging
    if (u_mouse.z > 0.5) {
      float dist = distance(fragCoord, u_mouse.xy);
      if (dist <= u_rippleSize) {
        gl_FragColor.x += u_rippleStrength * (1.0 - dist / u_rippleSize);
      }
    }
  }
`;
