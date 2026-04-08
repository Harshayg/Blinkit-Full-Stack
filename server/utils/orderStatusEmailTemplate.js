const orderStatusEmailTemplate = ({
  name,
  orderId,
  items = [],
  total,
  status,
  address,
  message
}) => {
  const itemsHtml = items.map((item, index) => `
    <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
      <td style="padding: 12px; text-align:center;">${index + 1}</td>
      <td style="padding: 12px; text-align:center;">
        <img src="${item.image?.[0] || ''}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;" />
      </td>
      <td style="padding: 12px; text-align:left; font-weight: 500; color: #111827;">${item.name}</td>
      <td style="padding: 12px; text-align:center; font-weight: 500;">${item.quantity}</td>
      <td style="padding: 12px; text-align:right; font-weight: 500; color: #111827;">₹${item.price * item.quantity}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Order Update</title>
</head>
<body style="background-color: #f0f2f5; font-family: 'Helvetica', Arial, sans-serif; margin:0; padding:0;">
  <div style="max-width: 700px; margin: 2rem auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.08);">

    <!-- Banner -->
    <div style="background-color: #ffe5e5; text-align:center; padding: 1.5rem;">
      <img src="https://cdn-icons-png.flaticon.com/512/1828/1828665.png" alt="Cancelled" style="width: 50px; height: 50px; margin-bottom: 0.5rem;" />
      <h2 style="color: #b91c1c; margin: 0; font-size: 22px;">Order ${status}</h2>
      <p style="color: #b91c1c; margin: 0.5rem 0 0; font-size: 14px;">
        ${message || 'You have requested a cancellation, which has been completed. If you face any issues, please contact support.'}
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 2rem;">
      <p style="font-size: 16px; color: #374151;">Hello <strong>${name}</strong>,</p>

      <div style="background: #f9fafb; border-radius: 12px; padding: 1rem; margin: 1rem 0;">
        <p style="margin: 0.25rem 0;"><strong>Order ID:</strong> ${orderId}</p>
        <p style="margin: 0.25rem 0;"><strong>Status:</strong> ${status}</p>
        <p style="margin: 0.25rem 0;"><strong>Delivery Address:</strong> ${address}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #111827;">
        <thead style="background-color: #f3f4f6; font-weight: 600;">
          <tr>
            <th style="padding: 12px; text-align:center;">#</th>
            <th style="padding: 12px; text-align:center;">Image</th>
            <th style="padding: 12px; text-align:left;">Product Name</th>
            <th style="padding: 12px; text-align:center;">Qty</th>
            <th style="padding: 12px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr style="background-color: #f9fafb; font-weight: bold;">
            <td colspan="4" style="padding: 12px; text-align:right;">Grand Total</td>
            <td style="padding: 12px; text-align:right;">₹${total}</td>
          </tr>
        </tbody>
      </table>

      <p style="text-align:center; font-size: 13px; color: #6b7280; margin-top: 2rem;">
        If you face any issues, please <a href="mailto:support@company.com" style="color:#2563eb; text-decoration:none;">contact our support</a>.<br/>
        Thanks for shopping with us!<br/>The Company Team
      </p>
    </div>
  </div>
</body>
</html>`;
};

export default orderStatusEmailTemplate;
