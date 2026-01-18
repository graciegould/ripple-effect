/**
 * Image rendering fragment shader
 * Applies water distortion and optional chromatic aberration to the image
 */
export const imageRenderShader = `
  precision highp float;

  uniform sampler2D u_waterTexture;
  uniform sampler2D u_imageTexture;
  uniform vec2 u_resolution;
  uniform vec2 u_imageResolution;
  uniform float u_distortionStrength;
  uniform float u_chromaticAberrationStrength;
  uniform float u_chromaticAberrationDispersal;
  uniform bool u_enableChromaticAberration;

  varying vec2 v_texCoord;

  void main() {
    vec4 waterData = texture2D(u_waterTexture, v_texCoord);

    // Calculate aspect ratios for cover fit
    float canvasAspect = u_resolution.x / u_resolution.y;
    float imageAspect = u_imageResolution.x / u_imageResolution.y;

    // Calculate scale to cover canvas while maintaining aspect ratio
    float scale;
    if (canvasAspect > imageAspect) {
      scale = u_resolution.x / u_imageResolution.x;
    } else {
      scale = u_resolution.y / u_imageResolution.y;
    }

    // Calculate scaled image dimensions
    vec2 scaledImageSize = u_imageResolution * scale;

    // Center the image
    vec2 offset = (u_resolution - scaledImageSize) * 0.5;

    // Convert screen space to image space
    vec2 screenPos = gl_FragCoord.xy;
    vec2 imagePos = (screenPos - offset) / scale;
    vec2 texCoord = imagePos / u_imageResolution;

    // Flip Y axis for correct orientation
    vec2 fixedTexCoord = vec2(texCoord.x, 1.0 - texCoord.y);

    // Base distortion from water simulation
    vec2 distortion = u_distortionStrength * waterData.zw;

    vec3 color = vec3(0.0);

    if (u_enableChromaticAberration && u_chromaticAberrationStrength > 0.0) {
      // Chromatic aberration effect
      vec2 center = vec2(0.5, 0.5);
      vec2 offsetFromCenter = fixedTexCoord - center;
      float distanceFromCenter = length(offsetFromCenter);

      float aberrationAmount = u_chromaticAberrationStrength * u_chromaticAberrationDispersal;
      float waterDistortionMagnitude = length(distortion);
      float waterContribution = waterDistortionMagnitude * u_chromaticAberrationStrength * 0.5;
      float radialContribution = distanceFromCenter * aberrationAmount;
      float totalAberration = waterContribution + radialContribution;

      vec2 radialDirection = normalize(offsetFromCenter + vec2(0.001, 0.001));

      // Separate RGB channels
      vec2 redOffset = distortion - radialDirection * totalAberration;
      vec2 greenOffset = distortion;
      vec2 blueOffset = distortion + radialDirection * totalAberration;

      color.r = texture2D(u_imageTexture, fixedTexCoord + redOffset).r;
      color.g = texture2D(u_imageTexture, fixedTexCoord + greenOffset).g;
      color.b = texture2D(u_imageTexture, fixedTexCoord + blueOffset).b;

      color = clamp(color, 0.0, 1.0);
    } else {
      // Standard sampling without chromatic aberration
      color = texture2D(u_imageTexture, fixedTexCoord + distortion).rgb;
    }

    // Add subtle water glint/highlight
    vec3 normal = normalize(vec3(-waterData.z, 0.2, -waterData.w));
    vec3 lightDir = normalize(vec3(-3.0, 10.0, 3.0));
    float glint = pow(max(0.0, dot(normal, lightDir)), 60.0);
    vec3 glintColor = vec3(1.0, 0.95, 0.9);

    gl_FragColor = vec4(color + glint * glintColor, 1.0);
  }
`;
