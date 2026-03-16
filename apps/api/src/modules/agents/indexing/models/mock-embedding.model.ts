export class MockEmbeddingModel {
  constructor(private readonly dimensions = 768) {}

  embed(text: string): number[] {
    const vector = new Array<number>(this.dimensions).fill(0);
    let seed = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      seed ^= text.charCodeAt(index);
      seed = Math.imul(seed, 16777619);
    }

    let state = seed >>> 0;
    for (let i = 0; i < this.dimensions; i += 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      vector[i] = (state / 0xffffffff) * 2 - 1;
    }

    return vector;
  }
}
