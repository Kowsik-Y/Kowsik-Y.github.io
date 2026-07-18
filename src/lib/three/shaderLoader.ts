export async function loadShader(path: string): Promise<string> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load shader: ${path}`);
  return res.text();
}

export const shaderPaths = {
  flowField: "/shaders/flowField.glsl",
  flowFieldVertex: "/shaders/flowField.vert.glsl",
  noise3D: "/shaders/noise3D.glsl",
  gitGraph: "/shaders/gitGraph.glsl",
  gitGraphVertex: "/shaders/gitGraph.vert.glsl",
  constellation: "/shaders/constellation.glsl",
  constellationVertex: "/shaders/constellation.vert.glsl",
  tensorFlow: "/shaders/tensorFlow.glsl",
  tensorFlowVertex: "/shaders/tensorFlow.vert.glsl",
  attention: "/shaders/attention.glsl",
  attentionVertex: "/shaders/attention.vert.glsl",
  merkleTree: "/shaders/merkleTree.glsl",
  merkleTreeVertex: "/shaders/merkleTree.vert.glsl",
  contribCal: "/shaders/contribCal.glsl",
  contribCalVertex: "/shaders/contribCal.vert.glsl",
  terminal: "/shaders/terminal.glsl",
  terminalVertex: "/shaders/terminal.vert.glsl",
} as const;

export type ShaderKey = keyof typeof shaderPaths;