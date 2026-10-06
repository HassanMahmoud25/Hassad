import type {NavigatorScreenParams} from '@react-navigation/native';
import type {Benefit, Book} from '../apis/types';

export type TabParamList = {
  harvest: undefined;
  library: undefined;
  selections: undefined;
};

export type RootStackParamList = {
  tabs: NavigatorScreenParams<TabParamList> | undefined;
  playground: undefined;
  /** «أنا», opened from the seal on «حصادي». */
  me: undefined;
  /** No `GET /books/:id` exists, so the book travels with the route and is
   * refreshed from the bookcase cache. */
  book: {book: Book};
  shelf: {folderId: string};
  bookForm: {book?: Book; folderId?: string | null};
  /** The knowledge page. `note` renders at once while the list loads. */
  note: {bookId: string; noteId: string; note?: Benefit};
  /** Add (no note) or edit (with note). */
  editor: {bookId: string; note?: Benefit};
  /** Capture from anywhere: choose the book, then write. */
  capture: undefined;
  /** Everything, or within one book, one shelf, or «مختاراتي». */
  search: {bookId?: string; folderId?: string; selections?: boolean} | undefined;
  /** Signed in. `from` decides where "later"/"done" return to. */
  verifyEmail: {from: 'signUp' | 'me'};
  changePassword: undefined;
  /** Signed out. */
  onboarding: undefined;
  signIn: undefined;
  signUp: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
