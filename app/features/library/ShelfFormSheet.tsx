import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createFolder, renameFolder} from '../../apis/folders.api';
import {toApiError} from '../../apis/errors';
import {Folder} from '../../apis/types';
import {queryKeys} from '../../queries/queryKeys';
import {useT} from '../../lib/i18n';
import {Button, Field, IconButton, Sheet, Text} from '../../ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Rename this shelf; omit to create one. */
  folder?: Folder;
}

export const ShelfFormSheet = ({visible, onClose, folder}: Props) => {
  const {t} = useT();
  const queryClient = useQueryClient();
  const [name, setName] = useState(folder?.name ?? '');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(folder?.name ?? '');
      setTouched(false);
    }
  }, [visible, folder]);

  const save = useMutation({
    mutationFn: async () => {
      const trimmed = name.trim();
      if (folder) {
        return renameFolder(folder._id, trimmed);
      }
      const data = new FormData();
      data.append('name', trimmed);
      return createFolder(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.folders.all});
      onClose();
    },
  });

  const empty = name.trim().length === 0;
  const submit = () => {
    setTouched(true);
    if (!empty) {
      save.mutate();
    }
  };
  const serverError = save.error ? toApiError(save.error) : undefined;

  return (
    <Sheet visible={visible} onClose={onClose} accessibilityLabel={folder ? t('shelfForm.renameShelf') : t('shelfForm.newShelf')}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <Text role="display3" style={{flex: 1}}>
          {folder ? t('shelfForm.renameShelf') : t('shelfForm.newShelf')}
        </Text>
        <IconButton icon="close" label={t('common.close')} small onPress={onClose} />
      </View>
      <View style={{marginTop: 16}}>
        <Field
          label={t('shelfForm.nameLabel')}
          placeholder={t('shelfForm.namePlaceholder')}
          value={name}
          onChangeText={setName}
          serif
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submit}
          maxLength={80}
          error={touched && empty ? t('shelfForm.nameRequired') : serverError ? (serverError.kind === 'network' ? t('common.offline') : t('shelfForm.saveError')) : undefined}
        />
      </View>
      <Button
        label={folder ? t('shelfForm.save') : t('shelfForm.create')}
        block
        loading={save.isPending}
        onPress={submit}
        style={{marginTop: 18}}
      />
    </Sheet>
  );
};
