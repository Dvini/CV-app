// @ts-nocheck
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { A4_HEIGHT_PX } from '../constants/layout';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * Exports the CV preview pages to a PDF file.
 * Captures each visible page clone element and adds it as a PDF page.
 *
 * @param {string} fileName - The PDF file name (without extension)
 */
export async function exportToPDF(fileName = 'CV') {
  const pages = document.querySelectorAll('.cv-page-sheet .cv-preview-container');
  if (pages.length === 0) return;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: page.offsetWidth,
      height: A4_HEIGHT_PX,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
  }

  pdf.save(`${fileName}.pdf`);
}

