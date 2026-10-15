import { useCVAppearance } from '../context/hooks';
import { cvTranslations } from '../constants/translations';

export type CVTranslation = (typeof cvTranslations)['pl'];

/** Texts printed on the CV itself, in the CV's language (not the editor's). */
export function useCVTranslation(): CVTranslation {
  const { cvLanguage } = useCVAppearance();
  return cvTranslations[cvLanguage] ?? cvTranslations.pl;
}
