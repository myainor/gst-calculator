// Set the theme before first paint so there is no flash.
try {
  var t = localStorage.getItem('gst-theme');
  document.documentElement.dataset.theme = t === 'light' || t === 'dark' ? t
    : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
} catch (e) { document.documentElement.dataset.theme = 'dark'; }
