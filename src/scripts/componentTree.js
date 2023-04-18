export function generateTree(parts,root, onClickCallback) {
    // PAKE VISITED JUST IN CASE DATA INPUT ADA YG CHILD/SIBLINGNYA SALAH (LUPA GANTI) BIAR GA INF LOOP
    const visited = new Set();
    const results = [];
    // Mulai dari root
    dfs(parts, root , visited, 0, results);
    const componentTree = document.getElementById("component-tree");
    for (let i = 0; i < results.length; i++) {
      const button = document.createElement("button");
      button.innerHTML = results[i][0];
      button.style.marginLeft = `${results[i][1] * 25}px`;
      button.style.marginTop = "2px";
      button.style.marginBottom = "2px";
      button.setAttribute("name", results[i][0]);
      button.onclick = (e) => onClickCallback(e);
      componentTree.appendChild(button);
    }
  }

function dfs(parts, name, visited, depth, results) {
    //HANDLE JUST IN CASE NAMA PARTNYA NGGAADA, biar ga error aja
    // console.log(part)
    if (parts[name] && !visited.has(name)) {

      visited.add(parts[name].name, depth);
      results.push([parts[name].name, depth])

      // DFS CHILD DULU BARU SIBLING
      dfs(parts, parts[name].child, visited, depth+1, results);
      dfs(parts, parts[name].sibling, visited, depth, results);
    }
  }