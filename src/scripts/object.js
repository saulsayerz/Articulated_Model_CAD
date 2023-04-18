class Object {
  constructor(name, vertices, colors, normals, child, sibling) {
    this.name = name;
    this.vertices = vertices;
    this.colors = colors;
    this.normals = normals;
    this.child = child;
    this.sibling = sibling;
  }
}

export default Object;
