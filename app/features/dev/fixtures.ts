// Dev-only sample books for the QA playground. Never shown in the product.
import type {ShelfBook} from '../../ui';

export const SAMPLE_PHOTO = 'https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg?default=false';

export const sampleBooks: ShelfBook[] = [
  {id: 'fx-ayyam', title: 'الأيام', author: 'طه حسين'},
  {id: 'fx-muqaddima', title: 'مقدمة ابن خلدون', author: 'ابن خلدون'},
  {id: 'fx-risala', title: 'رسالة في الطريق إلى ثقافتنا', author: 'محمود محمد شاكر'},
  {id: 'fx-sapiens', title: 'Sapiens', author: 'Yuval Noah Harari'},
  {id: 'fx-photo', title: 'Meditations', author: 'Marcus Aurelius', imageUrl: SAMPLE_PHOTO},
  {id: 'fx-mixed', title: 'ملاحظات على كتاب Atomic Habits', author: 'حسن'},
  {id: 'fx-kahneman', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman'},
  {id: 'fx-long-ar', title: 'مقدمة ابن خلدون في التاريخ والعمران البشري وأحوال الدول والأمم', author: 'عبد الرحمن بن خلدون'},
  {id: 'fx-long-en', title: 'The Courage to Be Disliked: How to Free Yourself, Change Your Life and Achieve Real Happiness', author: 'Ichiro Kishimi'},
  {id: 'fx-broken', title: 'صيد الخاطر', author: 'ابن الجوزي', imageUrl: 'https://example.invalid/missing.jpg'},
];
