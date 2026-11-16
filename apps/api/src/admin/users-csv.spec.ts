import { describe, expect, it } from 'vitest';
import { parseUsersCsv } from './users-csv.js';

describe('parseUsersCsv', () => {
  it('reads name;room;username lines, skipping a header, blank lines and the BOM', () => {
    const csv = '﻿nome;quarto;username\r\nAna Silva;101;Ana.Silva\r\n\r\nRui Costa;102;rui';

    expect(parseUsersCsv(csv)).toEqual({
      rows: [
        { name: 'Ana Silva', room: '101', username: 'ana.silva', line: 2 },
        { name: 'Rui Costa', room: '102', username: 'rui', line: 4 },
      ],
      errors: [],
    });
  });

  it('reports every bad line at once, with its line number', () => {
    const { rows, errors } = parseUsersCsv('Ana;101;ana\nonly-two;cols\n;102;rui\nZé;103;zé');

    expect(rows).toHaveLength(1);
    expect(errors.map((e) => e.line)).toEqual([2, 3, 4]);
    expect(errors[0].message).toMatch(/3 columns/);
  });

  it('rejects a username repeated inside the file', () => {
    const { errors } = parseUsersCsv('Ana;101;ana\nAna B;102;ANA');

    expect(errors).toEqual([{ line: 2, message: 'Username "ana" repeats line 1' }]);
  });

  it('only skips a header on the first line', () => {
    const { errors } = parseUsersCsv('Ana;101;ana\nnome;quarto;username');

    // Second "header" is a regular row: valid name/room, and "username" is free
    expect(errors).toEqual([]);
  });

  it('caps the number of rows per import', () => {
    const csv = Array.from({ length: 201 }, (_, i) => `User ${i};${i};user${i}`).join('\n');

    expect(parseUsersCsv(csv).errors).toEqual([
      { line: 0, message: 'At most 200 users per import' },
    ]);
  });
});
