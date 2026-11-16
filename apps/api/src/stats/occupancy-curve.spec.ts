import { describe, expect, it } from 'vitest';
import { occupancyCurve } from './occupancy-curve.js';

const at = (time: string) => new Date(`2026-01-07T${time}:00Z`);
const span = (entry: string, exit: string) => ({ entryAt: at(entry), exitAt: at(exit) });
const curve = (...args: Parameters<typeof occupancyCurve>) =>
  occupancyCurve(...args).map((p) => [p.at.toISOString().slice(11, 16), p.count]);

describe('occupancyCurve', () => {
  it('steps up on every entry and down on every exit', () => {
    expect(curve([span('18:00', '19:00'), span('18:30', '18:45')], at('17:00'), at('20:00'))).toEqual([
      ['17:00', 0],
      ['18:00', 1],
      ['18:30', 2],
      ['18:45', 1],
      ['19:00', 0],
      ['20:00', 0],
    ]);
  });

  it('starts with whoever was already inside at the start', () => {
    expect(curve([span('16:00', '18:00')], at('17:00'), at('20:00'))).toEqual([
      ['17:00', 1],
      ['18:00', 0],
      ['20:00', 0],
    ]);
  });

  it('merges people entering at the same instant into one step', () => {
    expect(curve([span('18:00', '19:00'), span('18:00', '19:00')], at('17:00'), at('20:00'))).toEqual([
      ['17:00', 0],
      ['18:00', 2],
      ['19:00', 0],
      ['20:00', 0],
    ]);
  });

  it('draws no step when one leaves exactly as another enters', () => {
    expect(curve([span('17:30', '18:00'), span('18:00', '18:30')], at('17:00'), at('20:00'))).toEqual([
      ['17:00', 0],
      ['17:30', 1],
      ['18:30', 0],
      ['20:00', 0],
    ]);
  });

  it('ignores visits outside the window and ends with whoever is still inside', () => {
    expect(curve([span('10:00', '11:00'), span('19:30', '21:00')], at('17:00'), at('20:00'))).toEqual([
      ['17:00', 0],
      ['19:30', 1],
      ['20:00', 1],
    ]);
  });

  it('returns nothing for an empty window', () => {
    expect(curve([], at('17:00'), at('17:00'))).toEqual([]);
  });
});
