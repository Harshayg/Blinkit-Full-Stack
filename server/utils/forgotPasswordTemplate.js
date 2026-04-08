/**
 * Generates an HTML email template for password reset using Tailwind CSS.
 *
 * @param {object} params - The parameters for the template.
 * @param {string} params.name - The recipient's name.
 * @param {string} params.otp - The One-Time Password.
 * @param {string} params.logoUrl - The URL for the company logo.
 * @param {string} [params.resetLink='https://example.com/reset-password'] - The base URL for the password reset link (OTP will be appended).
 * @returns {string} The HTML email template as a string.
 */
const forgotPasswordTemplate = ({ name, otp, resetLink = 'https://example.com/reset-password' }) => {
    // Construct the full reset URL with the OTP
    const fullResetLink = `${resetLink}?otp=${otp}`;

    // Return the HTML template using template literals
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .container {
            background-color: #ffffff;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            padding: 2.5rem;
            max-width: 42rem;
            width: 100%;
            border: 1px solid #e5e7eb;
            text-align: center;
            margin: 2rem auto;
        }
        .logo {
            margin-bottom: 1.5rem;
            text-align: center;
        }
        .logo img {
            max-height: 80px;
        }
    </style>
</head>
<body class="bg-gray-100" style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', sans-serif;">

    <div class="container">

        <div class="logo">
            <img src='https://i.postimg.cc/zbkqmxDQ/logo-svg.png'  alt="Company Logo" style="display: block; margin: 0 auto; max-height: 60px;">
        </div>

        <h2 style="font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; color: #1f2937; margin-bottom: 1rem;">
            Password Reset Request
        </h2>

        <p style="color: #4b5563; margin-bottom: 1.5rem; font-size: 1.125rem; line-height: 1.75rem;">
            Dear ${name},
        </p>

        <p style="color: #4b5563; margin-bottom: 1.5rem; font-size: 1.125rem; line-height: 1.75rem;">
            You requested a password reset. Please use the following One-Time Password (OTP) to complete the process:
        </p>

        <div style="background-color: #f0fdf4; color: #166534; font-size: 2.25rem; line-height: 2.5rem; font-weight: 600; padding: 1.5rem; border-radius: 0.5rem; margin-top: 2rem; margin-bottom: 2rem; border: 1px solid #bbf7d0; letter-spacing: 0.1em; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);">
            ${otp}
        </div>

        <div style="background-color: #eff6ff; color: #1d4ed8; padding: 1rem; border-radius: 0.5rem; margin-top: 2rem; margin-bottom: 2rem; border: 1px solid #bfdbfe; font-size: 0.875rem; line-height: 1.25rem;">
            <p>This OTP is valid for <strong>10 minutes</strong>. Please enter it on the website or app promptly.</p>
            <p style="margin-top: 0.5rem;">If you didn't request this, please ignore this email or contact support.</p>
        </div>

        <p style="margin-top: 2rem; font-size: 0.875rem; line-height: 1.25rem; color: #6b7280;">
            Thanks,<br>The Company Team
        </p>

    </div>

</body>
</html>`;
};

export default forgotPasswordTemplate;
