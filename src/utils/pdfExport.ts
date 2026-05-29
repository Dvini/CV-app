/**
 * Exports the CV to a PDF using the browser's native print dialog.
 * This preserves real text (selectable, searchable) and clickable hyperlinks.
 *
 * The @media print styles in CVPreview.css already handle hiding the UI chrome
 * (header, sidebar, labels) and formatting pages correctly for A4 output.
 *
 * @param {string} fileName - Suggested PDF file name (shown in print dialog; browser may override)
 */
export async function exportToPDF(fileName = 'CV') {
  // Set the document title so the browser suggests it as the PDF filename
  const previousTitle = document.title;
  document.title = fileName;

  window.print();

  // Restore the original title after a short delay (print dialog is async)
  setTimeout(() => {
    document.title = previousTitle;
  }, 1000);
}

