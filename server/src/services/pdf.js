const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateBillPdfToFile(bill, patient, filePath) {
  const total = (bill.items || []).reduce((s, i) => s + Number(i.amount || 0), 0);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text('Hospital Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Bill ID: ${bill._id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Patient: ${patient?.name || ''}`);
    if (patient?.phone) doc.text(`Phone: ${patient.phone}`);

    doc.moveDown();
    doc.text('Items:');
    (bill.items || []).forEach((item, i) => {
      doc.text(`${i + 1}. ${item.desc} — ₹${item.amount}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: ₹${total}`);

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

module.exports = { generateBillPdfToFile };
