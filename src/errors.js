export class InputError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export class ExecutionError extends Error {
  constructor(message, code = "PI_UNAVAILABLE", status = 502) { super(message); this.code = code; this.status = status; }
}
