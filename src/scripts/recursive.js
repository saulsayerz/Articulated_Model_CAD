export function recPosition(index, value, modelObject, root, sibling = true) {
  modelObject[root].translation[index] = value;

  if (modelObject[root].child !== "") {
    recPosition(index, value, modelObject, modelObject[root].child);
  }

  if (modelObject[root].sibling !== "" && sibling === true) {
    recPosition(index, value, modelObject, modelObject[root].sibling);
  }
}

export function recRotation(index, value, modelObject, root, sibling = true) {
  modelObject[root].rotation[index] = value;

  if (modelObject[root].child !== "") {
    recRotation(index, value, modelObject, modelObject[root].child);
  }

  if (modelObject[root].sibling !== "" && sibling === true) {
    recRotation(index, value, modelObject, modelObject[root].sibling);
  }
}

export function recScale(index, value, modelObject, root, sibling = true) {
  modelObject[root].scale[index] = value;

  if (modelObject[root].child !== "") {
    recScale(index, value, modelObject, modelObject[root].child);
  }

  if (modelObject[root].sibling !== "" && sibling === true) {
    recScale(index, value, modelObject, modelObject[root].sibling);
  }
}

export function recReset(modelObject, root, sibling = true) {
  modelObject[root].reset();

  if (modelObject[root].child !== "") {
    recReset(modelObject, modelObject[root].child);
  }

  if (modelObject[root].sibling !== "" && sibling === true) {
    recReset(modelObject, modelObject[root].sibling);
  }
}