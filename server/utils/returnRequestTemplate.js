// utils/returnRequestTemplate.js
const returnRequestTemplate = ({ name, orderId, items = [], reason, status }) => {
  const statusConfig = {
    "Return Requested": {
      color: "#f59e0b",
      bg: "#fef3c7",
      border: "#fcd34d",
      icon: "⏳",
      title: "Return Requested",
      message:
        "Your return request has been received. We’ll update you once it is confirmed."
    },
    "Return Confirmed": {
      color: "#16a34a",
      bg: "#ecfdf5",
      border: "#a7f3d0",
      icon: "✔",
      title: "Return Confirmed",
      message: `
        Your return request has been <b>confirmed</b>. Our delivery partner will soon approach you to pick up the returned item(s).  
        <br /><br />
        We will also take your feedback on the product during the pickup.  
        <br /><br />
        The refund amount will be credited back to your <b>original payment method</b> within the given timeline.  
        <br /><br />
        Thank you for your patience and we sincerely apologize for the inconvenience caused.
      `
    },
    "Return Cancelled": {
      color: "#dc2626",
      bg: "#fee2e2",
      border: "#fecaca",
      icon: "✖",
      title: "Return Cancelled",
      message:
        "Your return request was cancelled. If you face any issues, please contact the help center."
    }
  };

  const { color, bg, border, icon, title, message } =
    statusConfig[status] || statusConfig["Return Requested"];

  const itemsHtml = items
    .map(
      (item, index) => `
      <tr style="background-color: ${index % 2 === 0 ? "#ffffff" : "#f9fafb"};">
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align:center;">
          ${index + 1}
        </td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align:center;">
          <img src="${item.image?.[0] || ""}" alt="${
        item.name
      }" style="width: 50px; height: 50px; object-fit: cover; border-radius: 12px; border: 1px solid #e5e7eb;" />
        </td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align:left; font-weight: 500; color: #111827;">
          ${item.name}
        </td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align:center; font-weight: 500;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align:right; font-weight: 500; color: #111827;">
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="background-color: #f3f4f6; font-family: Arial, sans-serif; margin:0; padding:0;">
  <div style="max-width: 95%; width: 700px; margin: 1.5rem auto; background: #ffffff; border-radius: 12px; overflow:hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Top Header -->
    <div style="width: 100%; background-color: ${color}; padding: 2rem 1rem; text-align: center;">
      <div style="display: inline-block; background-color: #ffffff; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; text-align: center;">
        <span style="font-size: 48px; color: ${color};">${icon}</span>
      </div>
      <h2 style="font-size: 26px; font-weight: bold; color: #ffffff; margin-top: 1rem;">
        ${title}
      </h2>
    </div>

    <!-- Body -->
    <div style="padding: 1.5rem;">
      <p style="font-size: 16px; color: #374151; margin-bottom: 1rem;">
        Hello <strong>${name}</strong>,
      </p>
      <p style="font-size: 15px; color: #4b5563; margin-bottom: 1.5rem;">
        Your return request for order <strong>${orderId}</strong> is now marked as <b>${status}</b>.
      </p>
      ${
        reason
          ? `<p style="font-size: 14px; color: #374151; margin-bottom: 1rem;"><strong>Reason:</strong> ${reason}</p>`
          : ""
      }

      <!-- Products -->
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
        </tbody>
      </table>

      <!-- Message -->
      <div style="background-color: ${bg}; border: 1px solid ${border}; color: ${color}; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-weight: 500; line-height:1.6;">
        ${message}
      </div>

      <!-- Footer -->
      <p style="font-size: 13px; color: #6b7280; text-align:center; margin-top:2rem;">
        Thanks for shopping with us!<br />The Company Team
      </p>
    </div>
  </div>
</body>
</html>`;
};

export default returnRequestTemplate;
