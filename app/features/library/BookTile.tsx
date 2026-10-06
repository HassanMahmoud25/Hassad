import React from 'react';
import {Pressable, View} from 'react-native';
import {Book} from '../../apis/types';
import {Cover, Text} from '../../ui';
import {bindLatinRuns} from '../../lib/text';

/** A book in the All-books grid: the cover, then its full title. */
export const BookTile = ({book, width, onPress}: {book: Book; width: number; onPress: () => void}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={book.author ? `${book.name}، ${book.author}` : book.name}
    style={({pressed}) => ({width, opacity: pressed ? 0.75 : 1})}>
    <Cover seed={book._id} title={book.name} author={book.author} imageUrl={book.img_url} width={width} shadow="grid" decorative />
    <View style={{marginTop: 10}}>
      <Text role="title" numberOfLines={2} style={{fontSize: 16, lineHeight: 21}}>
        {bindLatinRuns(book.name)}
      </Text>
      {book.author ? (
        <Text role="meta" tone="ink3" numberOfLines={1} style={{marginTop: 1}}>
          {book.author}
        </Text>
      ) : null}
    </View>
  </Pressable>
);
