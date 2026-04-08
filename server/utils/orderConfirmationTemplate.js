const orderConfirmationTemplate = ({
  name,
  orderId,
  items = [],
  total,
  paymentMethod,
  status,
  address
}) => {
  const itemsHtml = items.map((item, index) => `
    <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
      <td style="padding: 12px; border: 1px solid #e5e7eb; text-align:center;">${index + 1}</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; text-align:center;">
        <img src="${item.image?.[0] || ''}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 12px; border: 1px solid #e5e7eb;" />
      </td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; text-align:left; font-weight: 500; color: #111827;">${item.name}</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; text-align:center; font-weight: 500;">${item.quantity}</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; text-align:right; font-weight: 500; color: #111827;">₹${item.price * item.quantity}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmation</title>
</head>
<body style="background-color: #f3f4f6; font-family: Arial, sans-serif; margin:0; padding:0;">
  <div style="max-width: 95%; width: 700px; margin: 1.5rem auto; background: #ffffff; border-radius: 12px; overflow:hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Top Square Header -->
    <div style="width: 100%; background-color: #10b981; padding: 2rem 1rem; text-align: center;">
      <div style="display: inline-block; background-color: #ffffff; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; text-align: center;">
        <span style="font-size: 48px; color: #10b981;">✔</span>
      </div>
      <h2 style="font-size: 26px; font-weight: bold; color: #ffffff; margin-top: 1rem;">
        Order Confirmed
      </h2>
    </div>

    <div style="padding: 1.5rem;">
      <p style="font-size: 16px; color: #374151; margin-bottom: 1rem;">
        Hello <strong>${name}</strong>,
      </p>
      <p style="font-size: 15px; color: #4b5563; margin-bottom: 1.5rem;">
        Thank you for your purchase! Here are your order details:
      </p>

      <div style="margin-bottom: 1.5rem; font-size: 15px; color: #374151;">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 14px; color: #111827;">
        <thead style="background-color: #f3f4f6;">
          <tr>
            <th style="padding: 12px; border: 1px solid #e5e7eb;">#</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb;">Image</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb;">Product Name</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb;">Qty</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr style="background-color: #f3f4f6;">
            <td colspan="4" style="padding: 12px; border: 1px solid #e5e7eb; text-align:right; font-weight:bold; font-size: 16px;">Grand Total</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb; text-align:right; font-weight:bold; font-size: 16px; color: #111827;">₹${total}</td>
          </tr>
        </tbody>
      </table>

      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-weight: 500;">
        Your order has been <strong>${status}</strong>. You will receive another update when it is shipped.
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align:center;">
        Thanks for shopping with us!<br>The Company Team
      </p>
    </div>
  </div>
</body>
</html>`;
};

export default orderConfirmationTemplate;
