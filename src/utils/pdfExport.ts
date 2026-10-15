/**
 * Exports the CV to a PDF using the browser's native print dialog.
 * This preserves real text (selectable, searchable) and clickable hyperlinks.
 *
 * The @media print styles in CVPreview.css already handle hiding the UI chrome
 * (header, sidebar, labels) and formatting pages correctly for A4 output.
 *
 * @param fileName - Suggested PDF file name (browsers use document.title for it)
 */
export function exportToPDF(fileName = 'CV'): void {
  const previousTitle = document.title;
  document.title = fileName;

  window.addEventListener(
    'afterprint',
    () => {
      document.title = previousTitle;
    },
    { once: true },
  );

  window.print();
}

/** Builds a file name like `CV_Jan_Kowalski` from the person's full name. */
export function getPDFFileName(fullName: string | undefined): string {
  const name = fullName?.trim();
  return name ? `CV_${name.replace(/\s+/g, '_')}` : 'CV';
}
