import type { InputLanguage } from '../types/prompt';

/**
 * Detects if text contains a significant amount of Hebrew characters.
 * Uses Unicode range \u0590-\u05FF for Hebrew characters.
 *
 * @param text - The text to analyze
 * @returns true if more than 30% of non-whitespace characters are Hebrew
 */
export function detectHebrew(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  const hebrewPattern = /[\u0590-\u05FF]/g;
  const hebrewChars = (text.match(hebrewPattern) || []).length;
  const totalChars = text.replace(/\s/g, '').length;

  if (totalChars === 0) {
    return false;
  }

  return hebrewChars / totalChars > 0.3;
}

/**
 * Detects the primary language of the input text.
 * Currently supports Hebrew and English detection.
 *
 * @param text - The text to analyze
 * @returns 'he' for Hebrew, 'en' for English (or other)
 */
export function detectInputLanguage(text: string): InputLanguage {
  return detectHebrew(text) ? 'he' : 'en';
}

/**
 * Checks if the text contains any Hebrew characters.
 * Useful for determining if translation might be needed.
 *
 * @param text - The text to analyze
 * @returns true if any Hebrew character is present
 */
export function containsHebrew(text: string): boolean {
  const hebrewPattern = /[\u0590-\u05FF]/;
  return hebrewPattern.test(text);
}

/**
 * Gets language display name
 */
export function getLanguageDisplayName(lang: InputLanguage): string {
  return lang === 'he' ? 'Hebrew' : 'English';
}
