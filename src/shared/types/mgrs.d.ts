declare module 'mgrs' {
  export function forward(ll: [number, number], precision?: number): string;
  export function toPoint(mgrs: string): [number, number];
  export function inverse(mgrs: string): [number, number, number, number];
  export function getLetterDesignator(latitude: number): string;
}
