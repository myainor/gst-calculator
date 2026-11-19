/**
 * Freelysta logo and wordmark. The artwork is a flat shape on a transparent
 * background, painted with `currentColor` through a CSS mask (see styles.css),
 * so it follows the theme instead of needing a light and a dark copy.
 */
export function FreelystaMark({ size = 22, className = '' }) {
  return <span role="img" aria-label="Freelysta" className={`fl-mark ${className}`} style={{ width: size, height: size }} />;
}

export function FreelystaWordmark({ height = 14, className = '' }) {
  // The artwork is 414 x 49.
  return <span role="img" aria-label="Freelysta" className={`fl-word ${className}`} style={{ height, width: Math.round((height * 414) / 49) }} />;
}
