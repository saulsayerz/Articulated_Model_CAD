//SCRIPT INI DIGUNAKAN OLEH 13520094 UNTUK MEMBUAT MODELNYA

const positions = [];
const colors = [];
const normals = [];

const numSegments = 5;
const radius = 75;
const thickness = 8;
const height = 100;

for (let i = 0; i < numSegments; i++) {
  const angle1 = i * 2 * Math.PI / numSegments;
  const angle2 = (i + 1) * 2 * Math.PI / numSegments;

  // Inner vertices
  const x1 = (radius - thickness) * Math.cos(angle1);
  const y1 = (radius - thickness) * Math.sin(angle1);
  const z1 = 0;
  const x2 = (radius - thickness) * Math.cos(angle2);
  const y2 = (radius - thickness) * Math.sin(angle2);
  const z2 = 0;
  const z3 = height;

  // Outer vertices
  const x3 = radius * Math.cos(angle1);
  const y3 = radius * Math.sin(angle1);
  const z4 = 0;
  const x4 = radius * Math.cos(angle2);
  const y4 = radius * Math.sin(angle2);
  const z5 = 0;
  const z6 = height;

  // Add vertices to arrays
  // Add vertices to arrays
  // PENTAGON BASE
  // BOTTOM SIDE
  positions.push(x1, y1, z1);
  positions.push(x4, y4, z5);
  positions.push(x2, y2, z2);

  positions.push(x1, y1, z1);
  positions.push(x3, y3, z4);
  positions.push(x4, y4, z5);

  //TOP SIDE
  positions.push(x1, y1, z1+thickness);
  positions.push(x4, y4, z5+thickness);
  positions.push(x2, y2, z2+thickness);


  positions.push(x1, y1, z1+thickness);
  positions.push(x3, y3, z4+thickness);
  positions.push(x4, y4, z5+thickness);


    //LEFT SIDE
    positions.push(x1, y1, z1);
    positions.push(x1, y1, z1+thickness);
    positions.push(x2, y2, z2);

    
    positions.push(x2, y2, z2);
    positions.push(x1, y1, z1+thickness);
    positions.push(x2, y2, z2+thickness);


    //RIGHT SIDE
    positions.push(x3, y3, z4);
    positions.push(x4, y4, z5);
    positions.push(x3, y3, z4+thickness);


    positions.push(x4, y4, z5);
    positions.push(x4, y4, z5+thickness);
    positions.push(x3, y3, z4+thickness);


  // Add colors and normals
    let r = Math.random();
    let g = Math.random();
    let b = Math.random();
    let a = 1.0;

    let r2 = Math.random();
    let g2 = Math.random();
    let b2 = Math.random();
    let a2 = 1.0;
  for (let j = 0; j < 6; j++) {
    colors.push(r,g,b,a);
    normals.push(0, 0, 1);
  }

  for (let j = 0; j < 6; j++) {
    colors.push(r+0.1,g+0.1,b+0.1,a);
    normals.push(0, 0, 1);
  }

  for (let j = 0; j < 6; j++) {
    colors.push(r-0.1,g-0.1,b-0.1,a);
    normals.push(0, 0, 1);
  }

  for (let j = 0; j < 6; j++) {
    colors.push(r+0.2,g+0.2,b+0.2,a);
    normals.push(0, 0, 1);
  }
  

// Pyramid vertices
const x5 = 0;
const y5 = 0;
const z7 = height + thickness;
const z8 = height;

// Pyramid edges in 3d with 4 faces

// edge 
positions.push(x4, y4, z5);
positions.push(x4, y4, z5+thickness);
positions.push(x5, y5, z7);

positions.push(x5, y5, z7);
positions.push(x4, y4, z5+thickness);
positions.push(x5, y5, z8);

positions.push(x5, y5, z8);
positions.push(x4, y4, z5+thickness);
positions.push(x2, y2, z5+thickness);

// -----------------------------------

positions.push(x4, y4, z5+thickness);
positions.push(x5, y5, z8);
positions.push(x5, y5, z7);

positions.push(x5, y5, z7);
positions.push(x5, y5, z8);
positions.push(x4, y4, z5+thickness);


// Add colors and normals
for (let j = 0; j < 15; j++) {
  colors.push(r2, g2, b2, a2);
  normals.push(0, 0, 1);
}

}


console.log({
    positions,
    colors,
    normals
})

export const model_try = {
    positions: positions,
    colors: colors,
    normals: normals
    }