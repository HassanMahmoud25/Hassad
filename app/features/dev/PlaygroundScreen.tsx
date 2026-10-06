import React, {ReactNode, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../theme/ThemeProvider';
import {bindings, gutter, NOTE_COLORS, Palette, ribbonFor} from '../../theme/tokens';
import {TextRole} from '../../theme/type';
import {currentLang, setLanguage} from '../../lib/locale';
import {Button, Chip, Cover, Glass, Icon, IconButton, Plank, Ribbon, Segmented, ShelfRow, ShelfRowSkeleton, Skeleton, Spine, SpineCase, Text} from '../../ui';
import type {IconName} from '../../ui';
import {Screen} from '../../ui/Screen';
import {Composition} from '../../ui/book/coverDesign';
import {sampleBooks} from './fixtures';
import {EmptyHarvest} from '../harvest/HarvestScreen';

const ROLES: TextRole[] = ['hero', 'display1', 'display2', 'display3', 'title', 'read', 'excerpt', 'body', 'small', 'label', 'meta', 'eyebrow', 'button', 'numeral'];
const ICONS: IconName[] = ['harvest', 'library', 'me', 'plus', 'search', 'bell', 'back', 'forward', 'chevronDown', 'arrowNext', 'more', 'star', 'share', 'edit', 'image', 'camera', 'lock', 'shelf', 'read', 'sort', 'grid', 'list', 'close', 'check', 'clock', 'offline', 'retry', 'mail', 'key', 'moon', 'sun', 'language', 'signOut', 'trash', 'info', 'copy', 'download'];
const COMPOSITIONS: Composition[] = ['framed', 'band', 'minimal', 'block', 'orb', 'type'];
const SWATCHES: (keyof Palette)[] = ['paper', 'paper2', 'paper3', 'card', 'ink', 'ink2', 'ink3', 'ink4', 'gold', 'goldInk', 'foil', 'danger', 'ok'];

const Section = ({title, children}: {title: string; children: ReactNode}) => {
  const {colors} = useTheme();
  return (
    <View style={{marginTop: 28}}>
      <View style={{paddingHorizontal: gutter, borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: 10, marginBottom: 12}}>
        <Text role="eyebrow" tone="gold">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
};

/** Dev-only QA board: every primitive in both scripts, both themes. */
export const PlaygroundScreen = () => {
  const {colors, prefs, setPref} = useTheme();
  const navigation = useNavigation();
  const [section, setSection] = useState<'covers' | 'type' | 'controls'>('covers');
  const pad = {paddingHorizontal: gutter};
  return (
    <Screen>
      <View style={[pad, {flexDirection: 'row', alignItems: 'center', gap: 8}]}>
        <IconButton icon="back" label="Back" onPress={() => navigation.goBack()} />
        <Text role="display3" style={{flex: 1}}>
          QA playground
        </Text>
      </View>
      <View style={[pad, {gap: 8, marginTop: 12}]}>
        <Segmented value={prefs.theme} onChange={v => setPref('theme', v)} options={[{value: 'light', label: 'Light'}, {value: 'dark', label: 'Dark'}, {value: 'system', label: 'System'}]} />
        <Segmented value={currentLang()} onChange={v => setLanguage(v)} options={[{value: 'ar', label: 'العربية'}, {value: 'en', label: 'English'}]} />
        <Segmented value={section} onChange={setSection} options={[{value: 'covers', label: 'Books'}, {value: 'type', label: 'Type'}, {value: 'controls', label: 'Controls'}]} />
      </View>

      {section === 'covers' && (
        <>
          <Section title="Shelf rows">
            <ShelfRow title="فكر وتاريخ" countLabel="7 كتب" books={sampleBooks.slice(0, 6)} onPressHeader={() => {}} onPressBook={() => {}} />
            <View style={{height: 22}} />
            <ShelfRow title="A shelf with a much longer name than usual for testing" countLabel="4 books" books={sampleBooks.slice(6)} onPressHeader={() => {}} />
            <View style={{height: 22}} />
            <ShelfRow title="رف فارغ" countLabel="لا كتب" books={[]} onAddBook={() => {}} addLabel="أضف كتاباً" emptyLabel="هذا الرف ينتظر كتابه الأول." onPressHeader={() => {}} />
            <View style={{height: 22}} />
            <ShelfRowSkeleton />
          </Section>

          {COMPOSITIONS.map(c => (
            <Section key={c} title={`Composition · ${c}`}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[pad, {gap: 14, alignItems: 'flex-end', paddingBottom: 18}]}>
                {sampleBooks.filter(b => !b.imageUrl).map(b => (
                  <Cover key={b.id} seed={b.id} title={b.title} author={b.author} width={104} composition={c} />
                ))}
              </ScrollView>
            </Section>
          ))}

          <Section title="Photo · broken photo · light cloth · hero">
            <View style={[pad, {flexDirection: 'row', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap'}]}>
              <Cover seed="fx-photo" title="Meditations" author="Marcus Aurelius" imageUrl={sampleBooks[4].imageUrl} width={104} />
              <Cover seed="fx-broken" title="صيد الخاطر" author="ابن الجوزي" imageUrl="https://example.invalid/x.jpg" width={104} />
              <Cover seed="fx-cream" title="الأيام" author="طه حسين" width={104} composition="orb" binding="cream" />
            </View>
            <View style={{alignItems: 'center', marginTop: 24, paddingBottom: 30}}>
              <Cover seed="fx-muqaddima" title="مقدمة ابن خلدون" author="ابن خلدون" width={172} shadow="hero" />
            </View>
          </Section>

          <Section title="Bindings">
            <View style={[pad, {flexDirection: 'row', flexWrap: 'wrap', gap: 8}]}>
              {bindings.map(b => (
                <Cover key={b.id} seed={b.id} title={b.id} width={52} binding={b.id} composition="type" shadow="shelf" />
              ))}
            </View>
          </Section>

          <Section title="Spine case">
            <View style={pad}>
              <SpineCase>
                {sampleBooks.map((b, i) => (
                  <Spine key={b.id} seed={b.id} hasPhoto={!!b.imageUrl} height={58 + ((i * 7) % 22)} lean={i === 5} />
                ))}
              </SpineCase>
            </View>
          </Section>
        </>
      )}

      {section === 'type' && (
        <>
          {ROLES.map(r => (
            <View key={r} style={[pad, {marginTop: 16}]}>
              <Text role="meta" tone="ink4">
                {r}
              </Text>
              <Text role={r}>الصبرُ مفتاحُ الفهم، والقراءةُ حصادُ العمر ١٢٣ 123</Text>
              <Text role={r}>Patience is the key to understanding 123</Text>
            </View>
          ))}
          <Section title="Mixed paragraphs (natural alignment)">
            <View style={[pad, {gap: 10}]}>
              <Text role="read" align="natural">
                قال الجاحظ: «الكتاب وعاءٌ مُلئ علماً» — وهذا ما ذكره في كتاب الحيوان، ص 38.
              </Text>
              <Text role="read" align="natural">
                The book is a vessel filled with knowledge, as al-Jahiz wrote in كتاب الحيوان.
              </Text>
            </View>
          </Section>
          <Section title="Palette">
            <View style={[pad, {flexDirection: 'row', flexWrap: 'wrap', gap: 8}]}>
              {SWATCHES.map(k => (
                <View key={k} style={{width: 72}}>
                  <View style={{height: 44, borderRadius: 10, backgroundColor: colors[k], borderWidth: 1, borderColor: colors.rule2}} />
                  <Text role="meta" tone="ink3">
                    {k}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[pad, {flexDirection: 'row', gap: 12, marginTop: 14, alignItems: 'center'}]}>
              {NOTE_COLORS.map(c => (
                <View key={c} style={{alignItems: 'center', gap: 4}}>
                  <Ribbon color={ribbonFor(c)} />
                  <View style={{width: 28, height: 28, borderRadius: 14, backgroundColor: c}} />
                </View>
              ))}
            </View>
          </Section>
        </>
      )}

      {section === 'controls' && (
        <>
          <Section title="Buttons">
            <View style={[pad, {gap: 10}]}>
              <Button label="احصد فائدة" icon="plus" block />
              <Button label="Harvest a note" variant="line" block />
              <View style={{flexDirection: 'row', gap: 8, flexWrap: 'wrap'}}>
                <Button label="لطيف" variant="soft" size="sm" />
                <Button label="أكّد الآن" variant="gold" size="xs" />
                <Button label="احذف الرف" variant="danger" size="sm" icon="trash" />
                <Button label="Loading" size="sm" loading />
                <Button label="معطّل" size="sm" disabled />
              </View>
            </View>
          </Section>
          <Section title="Home · no books yet (EmptyHarvest)">
            <EmptyHarvest onAdd={() => {}} />
          </Section>
          <Section title="Icons">
            <View style={[pad, {flexDirection: 'row', flexWrap: 'wrap', gap: 14}]}>
              {ICONS.map(name => (
                <View key={name} style={{width: 56, alignItems: 'center', gap: 4}}>
                  <Icon name={name} color={colors.ink} />
                  <Text role="meta" tone="ink4" numberOfLines={1} style={{fontSize: 9, lineHeight: 12}}>
                    {name}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
          <Section title="Icon buttons · chips">
            <View style={[pad, {flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center'}]}>
              <IconButton icon="search" label="search" />
              <IconButton icon="more" label="more" variant="fill" />
              <IconButton icon="share" label="share" variant="ink" />
              <IconButton icon="back" label="back" variant="glass" />
              <IconButton icon="star" label="star" small filled color={colors.gold} variant="fill" />
            </View>
            <View style={[pad, {flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12}]}>
              <Chip label="الكل" on onPress={() => {}} />
              <Chip label="فكر وتاريخ" onPress={() => {}} />
              <Chip label="Line chip" line icon="shelf" onPress={() => {}} />
              <Chip label="صغير" small />
            </View>
          </Section>
          <Section title="Glass over books">
            <View style={{height: 170, justifyContent: 'flex-end'}}>
              <View style={{position: 'absolute', top: 0, start: gutter, flexDirection: 'row', gap: 10}}>
                {sampleBooks.slice(0, 4).map(b => (
                  <Cover key={b.id} seed={b.id} title={b.title} author={b.author} width={86} imageUrl={b.imageUrl} />
                ))}
              </View>
              <View style={{paddingHorizontal: 22}}>
                <Glass radius={34} style={{height: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                  <Icon name="harvest" color={colors.ink} />
                  <Icon name="library" color={colors.ink3} />
                  <Icon name="me" color={colors.ink3} />
                </Glass>
              </View>
            </View>
          </Section>
          <Section title="Skeleton · plank">
            <View style={[pad, {gap: 8}]}>
              <Skeleton width="70%" height={14} />
              <Skeleton width="45%" height={14} />
            </View>
            <Plank style={{marginTop: 18}} />
          </Section>
        </>
      )}
    </Screen>
  );
};
