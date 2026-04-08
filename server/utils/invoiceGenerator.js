import PDFDocument from 'pdfkit';
import getStream from 'get-stream';

export const generateInvoiceBuffer = async (order) => {
  const doc = new PDFDocument();
  doc.fontSize(20).text('INVOICE', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);

  doc.text(`Order ID: ${order.orderId}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Payment: ${order.payment_status}`);
  doc.moveDown();

  doc.text('Products:');
  order.products.forEach((item, index) => {
    doc.text(`${index + 1}. ${item.name} - ₹${item.price} x ${item.quantity}`);
  });

  doc.moveDown();
  doc.text(`Subtotal: ₹${order.subTotalAmt}`);
  doc.text(`Discount: ₹${order.couponDiscount}`);
  doc.text(`Total: ₹${order.totalAmt}`, { bold: true });

  doc.end();
  return await getStream.buffer(doc);
};
