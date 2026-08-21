let currentTaskId: string | null = null;

export function setDragTaskId(id: string | null) {
  currentTaskId = id;
}

export function getDragTaskId() {
  return currentTaskId;
}
