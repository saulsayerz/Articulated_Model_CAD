class Object {
  constructor(
    name,
    vertices,
    colors,
    normals,
    children,
    siblings,
  ) {
    this.name = name;
    this.vertices = vertices;
    this.colors = colors;
    this.normals = normals;
    this.children = children;
    this.siblings = siblings;
  }
}

export default Object;