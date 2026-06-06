import { ThemeConfig, ThemeMode, Skin } from './types';

const woodBlockColors = [
  '#8B4513',
  '#A0522D',
  '#CD853F',
  '#D2691E',
  '#B8860B',
  '#996515',
  '#8B6914',
];

const metalBlockColors = [
  '#708090',
  '#778899',
  '#696969',
  '#4682B4',
  '#5F9EA0',
  '#483D8B',
  '#6A5ACD',
];

export function getThemeConfig(mode: ThemeMode, skin: Skin): ThemeConfig {
  const blockColors = skin === 'wood' ? woodBlockColors : metalBlockColors;

  if (mode === 'light') {
    if (skin === 'wood') {
      return {
        bgPrimary: '#FDF5E6',
        bgSecondary: '#FAEBD7',
        bgGrid: '#DEB887',
        bgCell: '#F5DEB3',
        bgCellFilled: '#8B4513',
        borderColor: '#A0522D',
        textPrimary: '#5D4037',
        textSecondary: '#8D6E63',
        accentColor: '#D84315',
        blockColors,
      };
    } else {
      return {
        bgPrimary: '#F0F4F8',
        bgSecondary: '#E2E8F0',
        bgGrid: '#CBD5E0',
        bgCell: '#EDF2F7',
        bgCellFilled: '#4A5568',
        borderColor: '#718096',
        textPrimary: '#1A202C',
        textSecondary: '#4A5568',
        accentColor: '#2B6CB0',
        blockColors,
      };
    }
  } else {
    if (skin === 'wood') {
      return {
        bgPrimary: '#2C1810',
        bgSecondary: '#3E2723',
        bgGrid: '#5D4037',
        bgCell: '#4E342E',
        bgCellFilled: '#8D6E63',
        borderColor: '#6D4C41',
        textPrimary: '#D7CCC8',
        textSecondary: '#A1887F',
        accentColor: '#FF7043',
        blockColors,
      };
    } else {
      return {
        bgPrimary: '#1A202C',
        bgSecondary: '#2D3748',
        bgGrid: '#4A5568',
        bgCell: '#2D3748',
        bgCellFilled: '#718096',
        borderColor: '#4A5568',
        textPrimary: '#E2E8F0',
        textSecondary: '#A0AEC0',
        accentColor: '#4299E1',
        blockColors,
      };
    }
  }
}

export function getBlockColor(skin: Skin, index: number): string {
  const colors = skin === 'wood' ? woodBlockColors : metalBlockColors;
  return colors[index % colors.length];
}
