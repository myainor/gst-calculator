export const MODES = [
  { value: 'exclusive', label: 'Add GST', hint: 'Price is before GST' },
  { value: 'inclusive', label: 'Remove GST', hint: 'Price includes GST' },
];
export const SUPPLY = [
  { value: 'intra', label: 'Same state', hint: 'CGST + SGST' },
  { value: 'inter', label: 'Other state', hint: 'IGST' },
];
export const VIEWS = [
  { value: 'single', label: 'Single amount' },
  { value: 'items', label: 'Multiple items' },
];
