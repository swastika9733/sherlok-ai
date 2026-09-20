export type Memory = {
  id: string;
  text: string;
  createdAt: string;
};

const STORAGE_KEY = "sherlokMemories";

export function getMemories(): Memory[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    return JSON.parse(saved) as Memory[];
  } catch {
    return [];
  }
}

export function addMemory(text: string): Memory {
  const normalizedText = text.trim();
  const memories = getMemories();
  const existingMemory = memories.find(
    (memory) => memory.text.trim().toLowerCase() === normalizedText.toLowerCase()
  );

  if (existingMemory) {
    return existingMemory;
  }

  const memory: Memory = {
    id: crypto.randomUUID(),
    text: normalizedText,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...memories, memory])
  );

  return memory;
}

export function deleteMemory(id: string): void {
  const memories = getMemories();

  const updatedMemories = memories.filter(
    (memory) => memory.id !== id
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedMemories)
  );
}

export function clearMemories(): void {
  localStorage.removeItem(STORAGE_KEY);
}