#!/usr/bin/env node
// Seeds the demo library (scripts/demo/library.mjs) into one Hassad account.
//
// Safe to run again and again: shelves, books and notes are matched by name
// and only what is missing is created. Nothing is ever updated or deleted,
// so anything added or changed in the app survives a re-run.
//
//   HASSAD_TOKEN=<session token> node scripts/demo/seed.mjs [--dry-run] [--covers]
//
// --covers also gives existing books that have an ISBN but no cover their real
// cover (for libraries seeded while the server couldn't store images). It
// never replaces a cover that is already there.
//
// HASSAD_API overrides the server (default: BASE_API_URL from .env).
// Covers for books with an ISBN are fetched from Open Library at run time;
// no image is stored in this repository.
import fs from 'node:fs';
import path from 'node:path';
import {shelves, unshelved} from './library.mjs';

// The repository root, from this script's own location (scripts/demo/seed.mjs).
const root = path.resolve(path.dirname(process.argv[1]), '../..');
const dry = process.argv.includes('--dry-run');
const addCovers = process.argv.includes('--covers');
const token = process.env.HASSAD_TOKEN;
const base = (
  process.env.HASSAD_API ??
  fs.readFileSync(path.join(root, '.env'), 'utf8').match(/BASE_API_URL\s*=\s*(\S+)/)?.[1] ??
  ''
).replace(/\/$/, '');
if (!token || !base) {
  console.error('Set HASSAD_TOKEN (and HASSAD_API, or BASE_API_URL in .env).');
  process.exit(1);
}

const call = async (method, route, fields, cover) => {
  let body;
  if (fields || cover) {
    body = new FormData();
    for (const [k, v] of Object.entries(fields ?? {})) {
      body.append(k, String(v));
    }
    if (cover) {
      body.append('image', new Blob([cover], {type: 'image/jpeg'}), 'cover.jpg');
    }
  }
  const res = await fetch(base + route, {method, headers: {Authorization: `Bearer ${token}`}, body});
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    // The backend answers some failures with HTTP 200 and a plain-text body.
    throw new Error(`${method} ${route} → ${res.status}: ${text.slice(0, 160)}`);
  }
  if (!res.ok) {
    throw new Error(`${method} ${route} → ${res.status}: ${text.slice(0, 160)}`);
  }
  return json;
};

const fetchCover = async isbn => {
  const res = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`);
  return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
};

const made = {shelves: 0, books: 0, covers: 0, notes: 0, selections: 0};
const kept = {shelves: 0, books: 0, notes: 0};
const coverFailed = [];

const seedNotes = async (bookId, notes) => {
  const existing = dry && !bookId ? [] : await call('GET', `/api/books/${bookId}/benefits`);
  const byName = new Set(existing.map(n => n.name));
  for (const n of notes) {
    if (byName.has(n.name)) {
      kept.notes++;
      continue;
    }
    made.notes++;
    if (dry) {
      continue;
    }
    const note = await call('POST', `/api/books/${bookId}/benefits`, {name: n.name, content: n.content, page_number: n.page, color: n.color});
    if (n.favourite) {
      await call('PUT', `/api/books/${bookId}/benefits/${note._id}/favourite`);
      made.selections++;
    }
  }
};

const seedBooks = async (books, folderId) => {
  const list = folderId ? `/api/folders/${folderId}/books` : '/api/books';
  const existing = dry && folderId === null ? [] : await call('GET', list);
  const byName = new Map(existing.map(b => [b.name, b]));
  for (const b of books) {
    let book = byName.get(b.name);
    if (book) {
      kept.books++;
      if (addCovers && b.isbn && !book.img_url) {
        const cover = await fetchCover(b.isbn);
        if (cover) {
          made.covers++;
          if (!dry) {
            // Shelved books can only be updated through their shelf.
            const route = folderId ? `/api/folders/${folderId}/books/${book._id}` : `/api/books/${book._id}`;
            try {
              await call('PUT', route, {}, cover);
            } catch (e) {
              if (!/upload failed/i.test(e.message)) {
                throw e;
              }
              made.covers--;
              coverFailed.push(b.name);
            }
          }
        }
      }
    } else {
      made.books++;
      const cover = b.isbn ? await fetchCover(b.isbn) : null;
      if (cover) {
        made.covers++;
      }
      if (!dry) {
        try {
          book = await call('POST', list, {name: b.name, author: b.author}, cover);
        } catch (e) {
          if (!cover || !/upload failed/i.test(e.message)) {
            throw e;
          }
          // The server's image upload is broken: keep the book, with its designed cover.
          made.covers--;
          coverFailed.push(b.name);
          book = await call('POST', list, {name: b.name, author: b.author});
        }
      }
    }
    await seedNotes(book?._id ?? null, b.notes);
  }
};

const folders = await call('GET', '/api/folders');
for (const s of shelves) {
  let folder = folders.find(f => f.name === s.name);
  if (folder) {
    kept.shelves++;
  } else {
    made.shelves++;
    if (!dry) {
      folder = await call('POST', '/api/folders', {name: s.name});
    }
  }
  await seedBooks(s.books, folder?._id ?? null);
}
await seedBooks(unshelved, undefined);

console.log(`${dry ? 'Would create' : 'Created'}: ${made.shelves} shelves, ${made.books} books (${made.covers} with real covers), ${made.notes} notes, ${made.selections} selections.`);
if (coverFailed.length) {
  console.log(`Server refused the cover upload for ${coverFailed.length} books; they use the designed cover: ${coverFailed.join(', ')}.`);
}
console.log(`Already there, left as is: ${kept.shelves} shelves, ${kept.books} books, ${kept.notes} notes.`);
