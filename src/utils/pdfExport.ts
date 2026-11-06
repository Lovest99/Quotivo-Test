import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  fileName?: string;
  quoteNumber: string;
  revision: number;
  businessName?: string;
  watermarkText?: string;
  isDraft?: boolean;
  onProgress?: (stage: string) => void;
}

/**
 * Exports an HTML element representing a quotation to a high-fidelity,
 * print-accurate A4 PDF document using jsPDF and html2canvas.
 */
export async function exportQuoteToPdf(
  element: HTMLElement,
  options: PdfExportOptions
): Promise<void> {
  const {
    fileName,
    quoteNumber,
    revision,
    watermarkText,
    isDraft = false,
    onProgress,
  } = options;

  onProgress?.('Preparing document for capture...');

  // Target filename format: e.g. QT-2027-0104_Rev1_Quotation.pdf
  const sanitizedNum = quoteNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
  const finalFileName =
    fileName || `${sanitizedNum}_Rev${revision}_Quotation.pdf`;

  // Render canvas with crisp retina resolution (scale: 2)
  onProgress?.('Rendering vector and typographic layers...');

  const canvas = await html2canvas(element, {
    scale: 2, // 2x scale ensures crisp numbers and vector lines
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 850,
    onclone: (clonedDoc, clonedElement) => {
      // Force paper white and charcoal text for dark mode users
      clonedElement.style.backgroundColor = '#ffffff';
      clonedElement.style.color = '#111827';
      clonedElement.style.width = '850px';
      clonedElement.style.maxWidth = '850px';
      clonedElement.style.boxShadow = 'none';
      clonedElement.style.border = 'none';
      clonedElement.style.margin = '0 auto';

      // Ensure printable table is visible and mobile cards are hidden in PDF output
      const mobileDocEls = clonedElement.querySelectorAll('.mobile-only-doc');
      mobileDocEls.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
      const desktopDocEls = clonedElement.querySelectorAll('.desktop-only-doc');
      desktopDocEls.forEach((el) => {
        (el as HTMLElement).style.display = 'block';
      });

      // If watermark requested (e.g. for draft exports)
      if (isDraft && watermarkText) {
        const watermark = clonedDoc.createElement('div');
        watermark.innerText = watermarkText;
        watermark.style.position = 'absolute';
        watermark.style.top = '40%';
        watermark.style.left = '50%';
        watermark.style.transform = 'translate(-50%, -50%) rotate(-35deg)';
        watermark.style.fontSize = '56px';
        watermark.style.fontWeight = 'bold';
        watermark.style.color = 'rgba(239, 68, 68, 0.12)';
        watermark.style.letterSpacing = '0.25em';
        watermark.style.pointerEvents = 'none';
        watermark.style.zIndex = '999';
        watermark.style.whiteSpace = 'nowrap';
        clonedElement.style.position = 'relative';
        clonedElement.appendChild(watermark);
      }
    },
  });

  onProgress?.('Assembling A4 PDF pages...');

  const imgData = canvas.toDataURL('image/png', 1.0);

  // Standard A4 dimensions in millimetres
  const pdfWidth = 210;
  const pdfHeight = 297;

  // Calculate proportional height in mm
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  let heightLeft = imgHeight;
  let position = 0;
  let page = 1;

  // Add first page
  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Add subsequent pages if the schedule of works or terms spans multi-page
  while (heightLeft > 0) {
    position = -(page * pdfHeight);
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    page += 1;
    heightLeft -= pdfHeight;
  }

  onProgress?.('Saving PDF document...');
  pdf.save(finalFileName);
}
