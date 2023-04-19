export function recPosition(index, value, modelObject, root, isSubTree, sibling = false) {
  modelObject[root].translation[index] = value;

  if (modelObject[root].child !== "" && isSubTree) {
    recPosition(index, value, modelObject, modelObject[root].child, isSubTree, true);
  }

  if (modelObject[root].sibling !== "" && sibling) {
    recPosition(index, value, modelObject, modelObject[root].sibling, isSubTree, true);
  }
}

export function recRotation(index, value, modelObject, root, isSubTree, sibling = false) {
  modelObject[root].rotation[index] = value;

  if (modelObject[root].child !== "" && isSubTree) {
    recRotation(index, value, modelObject, modelObject[root].child, isSubTree, true);
  }

  if (modelObject[root].sibling !== "" && sibling) {
    recRotation(index, value, modelObject, modelObject[root].sibling, isSubTree, true);
  }
}

export function recScale(index, value, modelObject, root, isSubTree, sibling = false) {
  modelObject[root].scale[index] = value;
  
  if (modelObject[root].child !== "" && isSubTree) {
    recScale(index, value, modelObject, modelObject[root].child, isSubTree, true);
  }

  if (modelObject[root].sibling !== "" && sibling) {
    recScale(index, value, modelObject, modelObject[root].sibling, isSubTree, true);
  }
}

export function recReset(modelObject, root, isSubTree, sibling=false) {
  modelObject[root].reset();

  if (modelObject[root].child !== "" && isSubTree) {
    recReset(modelObject, modelObject[root].child, isSubTree, true);
  }

  if (modelObject[root].sibling !== "" && sibling) {
    recReset(modelObject, modelObject[root].sibling, isSubTree, true);
  }
}
