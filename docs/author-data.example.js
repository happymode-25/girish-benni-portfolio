/**
 * AUTHOR DATA — EXAMPLE ONLY
 * ---------------------------------------------------------------------------
 * To use it:
 *   1. Copy this file to the project root as `author-data.js`.
 *   2. Replace every sample value with real information.
 *   3. Set the feature flag(s) in script.js → SITE_CONFIG.features.
 *   4. Build with `--author` (or let the build include it automatically when a
 *      flag is true).
 *
 * `author-data.js` is gitignored. Never put real author data in this example
 * file, in script.js, or in index.html.
 *
 * Fields that are empty are not rendered. Book entries render in this order:
 * sample link, purchase link, publisher link.
 */
window.AUTHOR_DATA = {
  // Shown as the large italic line in the author section.
  penName: 'Sample Pen Name',

  // Shown as the author intro when showAuthorIdentity is true.
  bio: 'This is sample text. Replace it with a short, factual bio in the voice you publish under. Do not include legal names, addresses, employers, or personal contact details unless you intend to make them public.',

  // Optional heading for the section. The site falls back to
  // SITE_CONFIG.author.sectionTitle when this is empty.
  sectionTitle: 'Selected books.',

  // Optional call to action under the bio. Both label and URL are required for
  // it to render. External http(s) URLs open in a new tab.
  cta: {
    label: '',
    url: '',
  },

  // Add one object per book. Empty strings are hidden.
  books: [
    {
      title: 'The Sample Book',
      genre: 'Fiction',
      description:
        'One or two sentences about the book, written as a description rather than a sales pitch. This sample is not a real title.',
      cover: '', // local path, drive:<id>, or OneDrive share URL
      sampleUrl: '',
      purchaseUrl: '',
      publisherUrl: '',
    },
    // {
    //   title: 'Second Book',
    //   genre: 'Non-fiction',
    //   description: 'Replace this entry or delete it.',
    //   cover: '',
    //   sampleUrl: '',
    //   purchaseUrl: '',
    //   publisherUrl: '',
    // },
  ],
};
