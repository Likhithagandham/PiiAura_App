export class BackendNotImplementedError extends Error {
  constructor(readonly feature: string) {
    super(`Backend endpoint not implemented: ${feature}`);
    this.name = "BackendNotImplementedError";
  }
}

export function backendNotImplemented(feature: string): never {
  throw new BackendNotImplementedError(feature);
}
