export interface User {
  _id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  profile_picture?: string;
  verified?: boolean;
}

/** Actual shape of POST /api/auth/register — the created user record.
 * No token is returned; the caller must log in separately to get one. */
export interface RegisterResponse {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  color?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Actual shape of POST /api/auth/login — no user object, only a JWT. */
export interface LoginResponse {
  message: string;
  token: string;
}

export interface Folder {
  _id: string;
  name: string;
  author?: string;
  img_url?: string;
  num_of_books: number;
  createdAt: string;
}

export interface Book {
  _id: string;
  name: string;
  // Collected on create (see AddItemModal) but not part of the response
  // shape this type originally documented — kept optional so the UI
  // degrades gracefully if the API omits it for a given book.
  author?: string;
  img_url?: string;
  /** Set when the book is on a shelf. `GET /api/books` only returns books
   * where this is null; shelved books come from `GET /api/folders/:id/books`. */
  folder?: string | null;
  user?: string;
  num_of_benefits: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Benefit {
  _id: string;
  book: string;
  name: string;
  content?: string;
  img_url?: string;
  page_number: number;
  color: string;
  border_color?: string;
  favourated: boolean;
  user?: string;
  createdAt: string;
  updatedAt?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortParams {
  sortBy?: 'date' | 'name';
  sortDirection?: SortDirection;
}
