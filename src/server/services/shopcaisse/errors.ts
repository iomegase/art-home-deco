export class ShopcaisseConfigError extends Error {}

export class ShopcaisseResponseError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ShopcaisseResponseError";
    this.statusCode = statusCode;
  }
}
