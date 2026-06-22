/*
  Minimal Jest globals typing for build-time.
  This avoids TS needing full @types/jest configuration.
*/

declare function describe(name: string, fn: () => void | Promise<void>): void;

declare function it(name: string, fn: () => void | Promise<void>): void;

declare const expect: (value: any) => {
  toBe: (v: any) => void;
  toEqual: (v: any) => void;
  toContain: (v: any) => void;
  toBeGreaterThan: (v: number) => void;
  toBeGreaterThanOrEqual: (v: number) => void;
  not?: {
    toBe: (v: any) => void;
  };
};


