import {Share} from 'react-native';
import {Benefit, Book} from '../../apis/types';

/** Plain-text export through the system share sheet. Runs entirely on the
 * device; nothing is uploaded. */
export const shareNotesAsText = (book: Book, notes: Benefit[], pageMark: string) => {
  const ordered = [...notes].sort((a, b) => a.page_number - b.page_number);
  const lines = [book.name, book.author ?? '', ''];
  ordered.forEach(n => {
    lines.push(`${pageMark} ${n.page_number} — ${n.name}`);
    if (n.content) {
      lines.push(n.content.trim());
    }
    lines.push('');
  });
  return Share.share({title: book.name, message: lines.join('\n').trim()});
};
