import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useT} from '../../lib/i18n';
import {RootStackParamList} from '../../navigation/types';
import {Button, IconButton, SheetScreen, Skeleton, Text} from '../../ui';
import {useBookcase} from '../library/useBookcase';
import {BookChooser} from './BookChooser';

type Props = NativeStackScreenProps<RootStackParamList, 'capture'>;

/**
 * Capture from anywhere (the tab's + button): choose the book, then write.
 * The most recently active book is chosen for you.
 */
export const CaptureScreen = ({navigation}: Props) => {
  const {t} = useT();
  const bookcase = useBookcase();
  const settled = !bookcase.loading && bookcase.shelves.every(s => !s.loading);
  const [selected, setSelected] = useState<string | undefined>();
  useEffect(() => {
    if (!selected && settled && bookcase.all.length) {
      const recent = [...bookcase.all].sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt))[0];
      setSelected(recent._id);
    }
  }, [settled, bookcase.all, selected]);

  return (
    <SheetScreen onDismiss={() => navigation.goBack()} accessibilityLabel={t('capture.title')}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <Text role="display3" accessibilityRole="header" style={{flex: 1}}>
          {t('capture.title')}
        </Text>
        <IconButton icon="close" label={t('common.close')} small onPress={() => navigation.goBack()} />
      </View>
      <Text role="small" tone="ink2" style={{marginTop: 2, marginBottom: 12}}>
        {bookcase.all.length || !settled ? t('capture.subtitle') : t('capture.noBooks')}
      </Text>
      {!settled ? (
        <View style={{gap: 14}}>
          {[0, 1, 2].map(i => (
            <View key={i} style={{flexDirection: 'row', gap: 14, alignItems: 'center'}}>
              <Skeleton width={36} height={54} radius={4} />
              <Skeleton width="55%" height={14} />
            </View>
          ))}
        </View>
      ) : (
        <BookChooser
          books={bookcase.all}
          selectedId={selected}
          onSelect={b => setSelected(b._id)}
          onNewBook={() => navigation.replace('bookForm', {folderId: null})}
        />
      )}
      <Button
        label={t('capture.write')}
        icon="edit"
        block
        disabled={!selected}
        onPress={() => selected && navigation.replace('editor', {bookId: selected})}
        style={{marginTop: 18, height: 54, borderRadius: 27}}
      />
    </SheetScreen>
  );
};
