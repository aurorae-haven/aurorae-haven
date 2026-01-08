/**
 * Habit Categories with Color Palette
 * TAB-HAB-07: Category color coding (10-color palette)
 * TAB-HAB-34: Category chips use shared 10-colour palette
 */

export const CATEGORY_COLORS = {
  default: { bg: '#3d4263', text: '#eef0ff', name: 'Default' },
  blue: { bg: '#4a90e2', text: '#ffffff', name: 'Blue' },
  violet: { bg: '#9b59b6', text: '#ffffff', name: 'Violet' },
  green: { bg: '#2ecc71', text: '#ffffff', name: 'Green' },
  yellow: { bg: '#f39c12', text: '#1a1d2e', name: 'Yellow' },
  red: { bg: '#e74c3c', text: '#ffffff', name: 'Red' },
  orange: { bg: '#e67e22', text: '#ffffff', name: 'Orange' },
  pink: { bg: '#fd79a8', text: '#1a1d2e', name: 'Pink' },
  teal: { bg: '#1abc9c', text: '#ffffff', name: 'Teal' },
  purple: { bg: '#6c5ce7', text: '#ffffff', name: 'Purple' }
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_COLORS).map(
  ([key, value]) => ({
    value: key,
    label: value.name,
    ...value
  })
)

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default
}
