import { useCallback, useRef } from 'react';
import { vertexShader, waterSimulationShader, imageRenderShader } from '../shaders';
import { WebGLRefs, ImageDimensions, MouseState } from '../types';

interface UseWebGLConfig {
  waveSpeed: number;
  springStrength: number;
  velocityDamping: number;
  pressureDamping: number;
  rippleSize: number;
  rippleStrength: number;
  distortionStrength: number;
  enableChromaticAberration: boolean;
  chromaticAberrationStrength: number;
  chromaticAberrationDispersal: number;
}

interface UseWebGLReturn {
  initWebGL: (canvas: HTMLCanvasElement, imageUrl: string) => void;
  render: () => void;
  handleResize: (width: number, height: number) => void;
  cleanup: () => void;
  webglRefs: React.MutableRefObject<WebGLRefs>;
  frameCountRef: React.MutableRefObject<number>;
  imageDimensionsRef: React.MutableRefObject<ImageDimensions>;
  mouseRef: React.MutableRefObject<MouseState>;
  animationRef: React.MutableRefObject<number | undefined>;
}

export const useWebGL = (config: UseWebGLConfig): UseWebGLReturn => {
  const webglRefs = useRef<WebGLRefs>({
    gl: null,
    waterProgram: null,
    imageProgram: null,
    framebufferA: null,
    framebufferB: null,
    textureA: null,
    textureB: null,
    imageTexture: null,
  });

  const frameCountRef = useRef(0);
  const imageDimensionsRef = useRef<ImageDimensions>({ width: 0, height: 0 });
  const animationRef = useRef<number>();
  const mouseRef = useRef<MouseState>({
    x: 0,
    y: 0,
    down: false,
    lastX: 0,
    lastY: 0,
  });

  const createShader = useCallback(
    (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    },
    []
  );

  const createProgram = useCallback(
    (
      gl: WebGLRenderingContext,
      vertexSource: string,
      fragmentSource: string
    ): WebGLProgram | null => {
      const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
      const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

      if (!vertShader || !fragShader) return null;

      const program = gl.createProgram();
      if (!program) return null;

      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        return null;
      }

      return program;
    },
    [createShader]
  );

  const createFramebuffer = useCallback(
    (
      gl: WebGLRenderingContext,
      width: number,
      height: number
    ): { framebuffer: WebGLFramebuffer | null; texture: WebGLTexture | null } => {
      const framebuffer = gl.createFramebuffer();
      const texture = gl.createTexture();

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

      return { framebuffer, texture };
    },
    []
  );

  const loadImage = useCallback(
    (gl: WebGLRenderingContext, url: string): WebGLTexture | null => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Create placeholder while image loads
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 1, 1);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        imageDimensionsRef.current = { width: image.width, height: image.height };
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      };
      image.src = url;

      return texture;
    },
    []
  );

  const initWebGL = useCallback(
    (canvas: HTMLCanvasElement, imageUrl: string) => {
      const gl = canvas.getContext('webgl');
      if (!gl) {
        console.error('WebGL not supported');
        return;
      }

      // Check for float texture support
      const ext = gl.getExtension('OES_texture_float');
      if (!ext) {
        console.error('Float textures not supported');
        return;
      }

      webglRefs.current.gl = gl;

      // Create shader programs
      const waterProgram = createProgram(gl, vertexShader, waterSimulationShader);
      const imageProgram = createProgram(gl, vertexShader, imageRenderShader);

      if (!waterProgram || !imageProgram) return;

      webglRefs.current.waterProgram = waterProgram;
      webglRefs.current.imageProgram = imageProgram;

      // Create framebuffers for ping-pong rendering
      const fbA = createFramebuffer(gl, canvas.width, canvas.height);
      const fbB = createFramebuffer(gl, canvas.width, canvas.height);

      webglRefs.current.framebufferA = fbA.framebuffer;
      webglRefs.current.framebufferB = fbB.framebuffer;
      webglRefs.current.textureA = fbA.texture;
      webglRefs.current.textureB = fbB.texture;

      // Load image texture
      webglRefs.current.imageTexture = loadImage(gl, imageUrl);

      // Create quad geometry
      const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    },
    [createProgram, createFramebuffer, loadImage]
  );

  const render = useCallback(() => {
    const { gl, waterProgram, imageProgram, textureA, textureB, framebufferA, framebufferB, imageTexture } =
      webglRefs.current;

    if (!gl || !waterProgram || !imageProgram) return;

    const canvas = gl.canvas as HTMLCanvasElement;
    frameCountRef.current++;

    // Create position buffer
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Ping-pong between textures
    const readTexture = frameCountRef.current % 2 === 0 ? textureA : textureB;
    const writeFramebuffer = frameCountRef.current % 2 === 0 ? framebufferB : framebufferA;
    const writeTexture = frameCountRef.current % 2 === 0 ? textureB : textureA;

    // First pass: Water simulation
    gl.bindFramebuffer(gl.FRAMEBUFFER, writeFramebuffer);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(waterProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, readTexture);
    gl.uniform1i(gl.getUniformLocation(waterProgram, 'u_texture'), 0);

    gl.uniform2f(gl.getUniformLocation(waterProgram, 'u_resolution'), canvas.width, canvas.height);
    gl.uniform1i(gl.getUniformLocation(waterProgram, 'u_frame'), frameCountRef.current);
    gl.uniform3f(
      gl.getUniformLocation(waterProgram, 'u_mouse'),
      mouseRef.current.x,
      mouseRef.current.y,
      mouseRef.current.down ? 1.0 : 0.0
    );

    gl.uniform1f(gl.getUniformLocation(waterProgram, 'u_waveSpeed'), config.waveSpeed);
    gl.uniform1f(gl.getUniformLocation(waterProgram, 'u_springStrength'), config.springStrength);
    gl.uniform1f(gl.getUniformLocation(waterProgram, 'u_velocityDamping'), config.velocityDamping);
    gl.uniform1f(gl.getUniformLocation(waterProgram, 'u_pressureDamping'), config.pressureDamping);
    gl.uniform1f(gl.getUniformLocation(waterProgram, 'u_rippleSize'), config.rippleSize);
    gl.uniform1f(gl.getUniformLocation(waterProgram, 'u_rippleStrength'), config.rippleStrength);

    const positionLocation = gl.getAttribLocation(waterProgram, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Second pass: Render image with distortion
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(imageProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, writeTexture);
    gl.uniform1i(gl.getUniformLocation(imageProgram, 'u_waterTexture'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.uniform1i(gl.getUniformLocation(imageProgram, 'u_imageTexture'), 1);

    gl.uniform2f(gl.getUniformLocation(imageProgram, 'u_resolution'), canvas.width, canvas.height);
    gl.uniform2f(
      gl.getUniformLocation(imageProgram, 'u_imageResolution'),
      imageDimensionsRef.current.width,
      imageDimensionsRef.current.height
    );
    gl.uniform1f(gl.getUniformLocation(imageProgram, 'u_distortionStrength'), config.distortionStrength);
    gl.uniform1i(
      gl.getUniformLocation(imageProgram, 'u_enableChromaticAberration'),
      config.enableChromaticAberration ? 1 : 0
    );
    gl.uniform1f(
      gl.getUniformLocation(imageProgram, 'u_chromaticAberrationStrength'),
      config.chromaticAberrationStrength
    );
    gl.uniform1f(
      gl.getUniformLocation(imageProgram, 'u_chromaticAberrationDispersal'),
      config.chromaticAberrationDispersal
    );

    const imagePositionLocation = gl.getAttribLocation(imageProgram, 'a_position');
    gl.enableVertexAttribArray(imagePositionLocation);
    gl.vertexAttribPointer(imagePositionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationRef.current = requestAnimationFrame(render);
  }, [config]);

  const handleResize = useCallback(
    (width: number, height: number) => {
      const { gl } = webglRefs.current;
      if (!gl) return;

      // Cancel current animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Update viewport
      gl.viewport(0, 0, width, height);

      // Recreate framebuffers with new size
      const fbA = createFramebuffer(gl, width, height);
      const fbB = createFramebuffer(gl, width, height);

      webglRefs.current.framebufferA = fbA.framebuffer;
      webglRefs.current.framebufferB = fbB.framebuffer;
      webglRefs.current.textureA = fbA.texture;
      webglRefs.current.textureB = fbB.texture;

      // Resume rendering
      render();
    },
    [createFramebuffer, render]
  );

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  return {
    initWebGL,
    render,
    handleResize,
    cleanup,
    webglRefs,
    frameCountRef,
    imageDimensionsRef,
    mouseRef,
    animationRef,
  };
};
