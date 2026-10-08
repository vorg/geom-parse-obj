import typedArrayConstructor from "typed-array-constructor";

const createGroup = () => ({
  name: "",
  faceData: [],
  hasVertexColors: false,
  hasUVs: false,
  hasNormals: false,
});

const resolveIndex = (token, count) => {
  const index = Number(token);
  if (index > 0) return index - 1;
  return index < 0 && count + index >= 0 ? count + index : null;
};

function parseObj(text) {
  // A trailing backslash continues a statement on the next line
  const lines = text
    .trim()
    .replaceAll(/\\[ \t]*\r?\n/g, " ")
    .split("\n");

  // Store parsed groups
  const groups = [];
  let g;

  // Store parsed attributes
  const positions = [];
  const vertexColors = [];
  const uvs = [];
  const normals = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replaceAll(/[\s]+/g, " ");
    const tokens = line.trim().split(" ");

    // Skip empty lines and commments
    if (!tokens[0] || tokens[0][0] === "#") continue;

    switch (tokens[0]) {
      // geometric vertices (skipping 4th coordinate): x y z
      case "v":
        positions.push([
          Number(tokens[1]),
          Number(tokens[2]),
          Number(tokens[3]),
        ]);

        // vertex colors (only if 4th, 5th and 6th defined): r g b
        // Indexed like positions as not every vertex may have a color
        if (tokens[4] && tokens[5] && tokens[6]) {
          vertexColors[positions.length - 1] = [
            Number(tokens[4]),
            Number(tokens[5]),
            Number(tokens[6]),
          ];
        }
        break;
      // texture vertices (skipping 3rd coordinate): u [v]
      case "vt":
        uvs.push([Number(tokens[1]), Number(tokens[2] ?? 0)]);
        break;
      // vertex normals: i j k
      case "vn":
        normals.push([Number(tokens[1]), Number(tokens[2]), Number(tokens[3])]);
        break;
      // face: v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3 ...
      case "f": {
        const faceData = []; // Array<[v, vt, vn]>
        for (let j = 1; j < tokens.length; j++) {
          const [v, vt, vn] = tokens[j].split("/", 3);
          faceData.push([
            resolveIndex(v, positions.length),
            resolveIndex(vt, uvs.length),
            resolveIndex(vn, normals.length),
          ]);
        }

        if (faceData.some(([p]) => p === null)) {
          console.warn(`geom-parse-obj: invalid face "${line}"`);
          break;
        }

        if (!g) {
          g = createGroup();
          g.name = `Mesh_${groups.length}`;
          groups.push(g);
        }

        if (faceData.some((data) => data[1] !== null)) g.hasUVs = true;
        if (faceData.some((data) => data[2] !== null)) g.hasNormals = true;
        if (faceData.some(([p]) => vertexColors[p])) g.hasVertexColors = true;

        // Make a triangle fan
        const v0 = faceData[0];
        for (let v = 1; v < faceData.length - 1; v++) {
          g.faceData.push([v0, faceData[v], faceData[v + 1]]);
        }
        break;
      }
      // Group
      case "g": {
        const name = tokens.slice(1).join(" ") || "default";
        // Faces of an already declared group are appended to it
        g = groups.find((group) => group.name === name);
        if (!g) {
          g = createGroup();
          g.name = name;
          groups.push(g);
        }
        break;
      }

      // Type list: http://paulbourke.net/dataformats/obj/
      // Unsupported: Vertex data
      case "vp":
      case "deg":
      case "bmat":
      case "step":
      // Unsupported: Elements
      case "p":
      case "l":
      case "curv":
      case "curv2":
      case "surf":
      // Unsupported: Free-form curve/surface body statements
      case "parm":
      case "trim":
      case "hole":
      case "scrv":
      case "sp":
      case "end":
      case "con":
      // Unsupported: Grouping
      case "s":
      case "mg":
      case "o":
      // Unsupported: Display/render attributes
      case "bevel":
      case "c_interp":
      case "d_interp":
      case "lod":
      case "usemtl":
      case "mtllib":
      case "shadow_obj":
      case "trace_obj":
      case "ctech":
      case "stech":
        console.warn(`geom-parse-obj: unsupported data type "${line}"`);
        break;
      default:
        console.error(`geom-parse-obj: unrecognized line "${line}"`);
    }
  }

  return groups.map((group) => {
    const size = group.faceData.length * 3;

    const geometry = {
      name: group.name,
      positions: [],
      cells: new (typedArrayConstructor(size))(size),
    };
    if (group.hasVertexColors) geometry.vertexColors = [];
    if (group.hasNormals) geometry.normals = [];
    if (group.hasUVs) geometry.uvs = [];

    const vertexIndexMap = [];

    let numVertices = 0;
    for (let t = 0; t < group.faceData.length; t++) {
      const faceData = group.faceData[t];

      for (let v = 0; v < 3; v++) {
        // Try to find existing data
        const hash = faceData[v].join("-");
        let index = vertexIndexMap[hash];
        if (index === undefined) {
          index = numVertices;
          vertexIndexMap[hash] = index;
          numVertices++;
        }
        geometry.cells[t * 3 + v] = index;

        const [pIndex, tIndex, nIndex] = faceData[v];

        geometry.positions[index] = positions[pIndex];
        if (group.hasVertexColors) {
          // Defaults for vertices missing an attribute keep attributes aligned
          geometry.vertexColors[index] = vertexColors[pIndex] ?? [1, 1, 1];
        }
        if (group.hasUVs) {
          geometry.uvs[index] = uvs[tIndex] ?? [0, 0];
        }
        if (group.hasNormals) {
          geometry.normals[index] = normals[nIndex] ?? [0, 0, 0];
        }
      }
    }

    // Attributes length is only available now as we try to dedupe incoming data
    geometry.positions = new Float32Array(geometry.positions.flat());
    if (group.hasVertexColors) {
      geometry.vertexColors = new Float32Array(geometry.vertexColors.flat());
    }
    if (group.hasNormals) {
      geometry.normals = new Float32Array(geometry.normals.flat());
    }
    if (group.hasUVs) {
      geometry.uvs = new Float32Array(geometry.uvs.flat());
    }

    return geometry;
  });
}

export default parseObj;
