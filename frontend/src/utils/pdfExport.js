import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export customer orders to PDF
export function exportOrdersToPDF(customers, orders) {
  const doc = new jsPDF();
  doc.text('Customer Orders Report', 14, 16);

  const rows = orders.map(order => [
    order.id,
    order.customer_name,
    order.items.map(i => i.toy).join(', '),
    order.order_date,
    order.delivery_address.country,
    order.delivery_date,
  ]);

  doc.autoTable({
    head: [['Order ID', 'Customer', 'Items', 'Order Date', 'Country', 'Delivery Date']],
    body: rows,
    startY: 24,
  });

  doc.save('customer_orders.pdf');
}