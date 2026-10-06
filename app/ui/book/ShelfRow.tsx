import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useTheme} from '../../theme/ThemeProvider';
import {gutter} from '../../theme/tokens';
import {Text} from '../Text';
import {Icon} from '../Icon';
import {Skeleton} from '../Skeleton';
import {Cover} from './Cover';
import {Plank} from './Plank';
import {Slot} from './Slot';
import {hash} from './coverDesign';

export interface ShelfBook {
  id: string;
  title: string;
  author?: string;
  imageUrl?: string | null;
}

interface ShelfRowProps {
  title: string;
  /** Already formatted, e.g. «7 كتب». */
  countLabel?: string;
  books: ShelfBook[];
  onPressHeader?: () => void;
  onPressBook?: (book: ShelfBook) => void;
  /** Shown as an empty slot at the end of the row. */
  onAddBook?: () => void;
  addLabel?: string;
  /** Line under an empty row. */
  emptyLabel?: string;
  /** When the screen sets its own section title above the row. */
  hideHeader?: boolean;
}

const ROW_HEIGHT = 122;

/** Books standing on a plank vary a little, like real books (≤ 6% in height). */
export const bookSize = (id: string) => {
  const width = [76, 78, 80][hash(id, 3) % 3];
  const height = Math.round(width * (1.46 + (hash(id, 5) % 6) * 0.01));
  return {width, height};
};

/** One row of the bookcase: shelf name, books on a plank. */
export const ShelfRow = ({title, countLabel, books, onPressHeader, onPressBook, onAddBook, addLabel, emptyLabel, hideHeader}: ShelfRowProps) => {
  const {colors} = useTheme();
  return (
    <View>
      {!hideHeader && (
      <Pressable
        onPress={onPressHeader}
        disabled={!onPressHeader}
        accessibilityRole={onPressHeader ? 'button' : 'header'}
        style={({pressed}) => ({flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: gutter, minHeight: 32, opacity: pressed ? 0.6 : 1})}>
        <Text role="title" numberOfLines={1} style={{flexShrink: 1}}>
          {title}
        </Text>
        {countLabel ? (
          <Text role="meta" tone="ink3" style={{flexGrow: 1}}>
            {countLabel}
          </Text>
        ) : (
          <View style={{flexGrow: 1}} />
        )}
        {onPressHeader && <Icon name="forward" size={16} color={colors.ink3} />}
      </Pressable>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{marginTop: hideHeader ? 4 : 10, height: ROW_HEIGHT}}
        contentContainerStyle={{paddingHorizontal: gutter, gap: 9, alignItems: 'flex-end', minWidth: '100%'}}>
        {books.map(b => {
          const {width, height} = bookSize(b.id);
          return (
            <Pressable key={b.id} onPress={() => onPressBook?.(b)} accessibilityRole="button" accessibilityLabel={b.author ? `${b.title}، ${b.author}` : b.title} style={({pressed}) => ({opacity: pressed ? 0.8 : 1, transform: [{translateY: pressed ? -2 : 0}]})}>
              <Cover seed={b.id} title={b.title} author={b.author} imageUrl={b.imageUrl} width={width} height={height} shadow="shelf" decorative />
            </Pressable>
          );
        })}
        {onAddBook && <Slot width={76} height={114} onPress={onAddBook} accessibilityLabel={addLabel} />}
        {books.length === 0 && emptyLabel ? (
          <View style={{flex: 1, height: 114, justifyContent: 'flex-end', paddingBottom: 8}}>
            <Text role="small" tone="ink3">
              {emptyLabel}
            </Text>
          </View>
        ) : null}
      </ScrollView>
      <Plank />
    </View>
  );
};

/** Placeholder row while the bookcase loads. */
export const ShelfRowSkeleton = ({count = 4}: {count?: number}) => (
  <View>
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: gutter, height: 32}}>
      <Skeleton width={110} height={16} />
      <Skeleton width={40} height={10} />
    </View>
    <View style={{marginTop: 10, height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: 9, paddingHorizontal: gutter, overflow: 'hidden'}}>
      {Array.from({length: count}, (_, i) => (
        <Skeleton key={i} width={78} height={[117, 114, 120, 116][i % 4]} radius={5} />
      ))}
    </View>
    <Plank />
  </View>
);
