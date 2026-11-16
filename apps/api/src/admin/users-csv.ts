import {
  MAX_IMPORT_ROWS,
  importedUserSchema,
  type ImportedUser,
} from '@gym-checkin/shared';

/** A problem in one line of the file (line numbers start at 1, like an editor). */
export interface ImportError {
  line: number;
  message: string;
}

export interface ParsedRow extends ImportedUser {
  line: number;
}

const SEPARATOR = ';';
const COLUMNS = 3;
// Accepted header lines (skipped): Portuguese or English
const HEADERS = new Set(['nome;quarto;username', 'name;room;username']);

/**
 * Parses "name;room;username" lines. A deliberately small format (no quotes,
 * no escaping) instead of a CSV library: names and rooms never contain ';'.
 * Excel in Portugal exports CSV with ';' by default, so it opens and saves it.
 * Returns every problem at once, so the admin fixes the file in one go.
 */
export function parseUsersCsv(text: string): {
  rows: ParsedRow[];
  errors: ImportError[];
} {
  const rows: ParsedRow[] = [];
  const errors: ImportError[] = [];
  const firstLineOf = new Map<string, number>();

  // Strip the BOM Excel adds at the start of UTF-8 files
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  lines.forEach((raw, index) => {
    const line = index + 1;
    const content = raw.trim();
    if (!content) return;
    if (rows.length === 0 && errors.length === 0 && HEADERS.has(content.toLowerCase())) {
      return;
    }

    const cols = content.split(SEPARATOR);
    if (cols.length !== COLUMNS) {
      errors.push({ line, message: 'Expected 3 columns: name;room;username' });
      return;
    }
    const [name, room, username] = cols;
    const result = importedUserSchema.safeParse({ name, room, username });
    if (!result.success) {
      errors.push({
        line,
        message: result.error.issues.map((i) => i.message).join('; '),
      });
      return;
    }

    const first = firstLineOf.get(result.data.username);
    if (first !== undefined) {
      errors.push({
        line,
        message: `Username "${result.data.username}" repeats line ${first}`,
      });
      return;
    }
    firstLineOf.set(result.data.username, line);
    rows.push({ ...result.data, line });
  });

  if (rows.length > MAX_IMPORT_ROWS) {
    errors.push({
      line: 0,
      message: `At most ${MAX_IMPORT_ROWS} users per import`,
    });
  }
  return { rows, errors };
}
