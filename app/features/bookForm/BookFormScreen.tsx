import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import ImagePicker, {Image as PickedImage} from 'react-native-image-crop-picker';
import {useTheme} from '../../theme/ThemeProvider';
import {useT} from '../../lib/i18n';
import {addBook, updateBook} from '../../apis/books.api';
import {addBookToFolder} from '../../apis/folders.api';
import {toApiError} from '../../apis/errors';
import {Book} from '../../apis/types';
import {queryKeys} from '../../queries/queryKeys';
import {RootStackParamList} from '../../navigation/types';
import {Button, Chip, Cover, Field, Icon, IconButton, SheetScreen, Text} from '../../ui';
import {useBookcase} from '../library/useBookcase';

type Props = NativeStackScreenProps<RootStackParamList, 'bookForm'>;

const useSettled = <T,>(value: T, ms: number) => {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return settled;
};

// The backend accepts JPEG or PNG up to 5 MB and resizes to 800 px wide;
// a 2:3 crop at that size keeps uploads small and covers sharp.
const PICK = {width: 800, height: 1200, cropping: true, mediaType: 'photo', forceJpg: true, compressImageQuality: 0.85} as const;

/**
 * Add or edit a book. The cover designs itself as you type; a photo, when
 * chosen, replaces it (Design Lock v2 §06).
 */
export const BookFormScreen = ({route, navigation}: Props) => {
  const {colors} = useTheme();
  const {t} = useT();
  const queryClient = useQueryClient();
  const editing = route.params?.book;
  const bookcase = useBookcase();
  const [name, setName] = useState(editing?.name ?? '');
  const [author, setAuthor] = useState(editing?.author ?? '');
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [folderId, setFolderId] = useState<string | null>(route.params?.folderId ?? null);
  const [touched, setTouched] = useState(false);
  const [shelfPicking, setShelfPicking] = useState(false);

  const save = useMutation({
    mutationFn: async (): Promise<Book> => {
      const image = photo ? {uri: photo.path, type: photo.mime || 'image/jpeg', name: 'cover.jpg'} : undefined;
      if (editing) {
        return updateBook(editing._id, editing.folder, {name: name.trim(), author: author.trim() || undefined, image});
      }
      const data = new FormData();
      data.append('name', name.trim());
      if (author.trim()) {
        data.append('author', author.trim());
      }
      if (image) {
        data.append('image', image as unknown as Blob);
      }
      return folderId ? addBookToFolder(folderId, data) : addBook(data);
    },
    onSuccess: book => {
      queryClient.invalidateQueries({queryKey: queryKeys.books.all});
      queryClient.invalidateQueries({queryKey: queryKeys.folders.all});
      if (editing) {
        navigation.goBack();
      } else {
        navigation.replace('book', {book});
      }
    },
  });

  const pick = async (camera: boolean) => {
    try {
      const img = camera ? await ImagePicker.openCamera(PICK) : await ImagePicker.openPicker(PICK);
      setPhoto(img);
    } catch {
      // Cancelled, or permission declined: keep the current cover.
    }
  };

  const empty = name.trim().length === 0;
  const submit = () => {
    setTouched(true);
    if (!empty && !save.isPending) {
      save.mutate();
    }
  };
  const err = save.error ? toApiError(save.error) : undefined;
  // The backend reports Cloudinary/sharp failures as the text "Upload failed".
  const uploadFailed = !!photo && err?.kind === 'server' && /upload|compression/i.test(err.message);
  const authorCleared = !!editing?.author && author.trim() === '';
  const shelfName = bookcase.shelves.find(s => s.folder._id === folderId)?.folder.name;
  // The design follows the title, settled a moment after typing stops, so
  // the cover doesn't flicker through designs on every keystroke.
  const previewTitle = useSettled(name.trim(), 450);

  return (
    <SheetScreen onDismiss={() => navigation.goBack()} accessibilityLabel={editing ? t('bookForm.editBook') : t('bookForm.newBook')}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <Text role="display3" style={{flex: 1}} accessibilityRole="header">
          {editing ? t('bookForm.editBook') : t('bookForm.newBook')}
        </Text>
        <IconButton icon="close" label={t('common.close')} small onPress={() => navigation.goBack()} />
      </View>

      <View style={{alignItems: 'center', marginTop: 8}}>
        <Cover
          title={previewTitle || t('bookForm.titlePlaceholder')}
          author={author.trim() || undefined}
          imageUrl={photo?.path ?? editing?.img_url}
          width={108}
          shadow="grid"
        />
      </View>

      <View style={{gap: 12, marginTop: 20}}>
        <Field
          label={t('bookForm.titleLabel')}
          placeholder={t('bookForm.titlePlaceholder')}
          value={name}
          onChangeText={setName}
          serif
          autoFocus={!editing}
          returnKeyType="next"
          maxLength={200}
          error={touched && empty ? t('bookForm.titleRequired') : undefined}
        />
        <Field label={t('bookForm.authorLabel')} hint={t('bookForm.optional')} placeholder={t('bookForm.authorPlaceholder')} value={author} onChangeText={setAuthor} returnKeyType="done" onSubmitEditing={submit} maxLength={120} />
        {authorCleared && (
          <Text role="meta" tone="ink3">
            {t('bookForm.authorCantClear')}
          </Text>
        )}
      </View>

      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.paper2}}>
        <Icon name="image" size={20} color={colors.ink2} />
        <View style={{flex: 1}}>
          <Text role="label">{t('bookForm.coverLabel')}</Text>
          <Text role="meta" tone="ink3">
            {photo ? t('bookForm.coverChosen') : editing?.img_url ? t('bookForm.coverExisting') : t('bookForm.coverHint')}
          </Text>
        </View>
        <IconButton icon="camera" label={t('bookForm.takePhoto')} small onPress={() => pick(true)} />
        <Button label={t('bookForm.choosePhoto')} variant="line" size="xs" onPress={() => pick(false)} />
      </View>

      {!editing && bookcase.shelves.length > 0 ? (
        <View style={{marginTop: 14}}>
          <Chip
            icon="shelf"
            line
            label={`${t('bookForm.shelfLabel')} · ${shelfName ?? t('bookForm.noShelf')}`}
            onPress={() => setShelfPicking(p => !p)}
          />
          {shelfPicking && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 8, paddingTop: 10}}>
              <Chip label={t('bookForm.noShelf')} on={folderId === null} onPress={() => setFolderId(null)} />
              {bookcase.shelves.map(s => (
                <Chip key={s.folder._id} label={s.folder.name} on={folderId === s.folder._id} onPress={() => setFolderId(s.folder._id)} />
              ))}
            </ScrollView>
          )}
        </View>
      ) : editing?.folder ? (
        <Text role="meta" tone="ink3" style={{marginTop: 12}}>
          {t('bookForm.shelfFixed')}
        </Text>
      ) : null}

      {uploadFailed ? (
        <View style={{marginTop: 12, gap: 8}}>
          <Text role="small" tone="danger">
            {t('bookForm.uploadFailed')}
          </Text>
          <Button
            label={t('bookForm.saveWithoutPhoto')}
            variant="line"
            size="sm"
            onPress={() => {
              setPhoto(null);
              save.reset();
            }}
          />
        </View>
      ) : err ? (
        <Text role="small" tone="danger" style={{marginTop: 12}}>
          {err.kind === 'network' ? t('common.offline') : err.kind === 'validation' ? err.message : t('bookForm.saveError')}
        </Text>
      ) : null}
      <Button label={editing ? t('bookForm.save') : t('bookForm.add')} block loading={save.isPending} onPress={submit} style={{marginTop: 16, height: 56, borderRadius: 28}} />
      {save.isPending && photo ? (
        <Text role="meta" tone="ink3" align="center" style={{marginTop: 8}}>
          {t('bookForm.uploadNote')}
        </Text>
      ) : null}
    </SheetScreen>
  );
};
