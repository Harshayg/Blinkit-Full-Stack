const verifyEmailTemplate = ({ name, url }) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
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
            Welcome to blinkit
        </h2>

        <p style="color: #4b5563; margin-bottom: 1.5rem; font-size: 1.125rem; line-height: 1.75rem;">
            Dear ${name},
        </p>

        <p style="color: #4b5563; margin-bottom: 1.5rem; font-size: 1.125rem; line-height: 1.75rem;">
            Thank you for registering with blinkit. Please click the button below to verify your email address.
        </p>

        <div style="background-color: #eff6ff; color: #1d4ed8; padding: 1rem; border-radius: 0.5rem; margin-top: 2rem; margin-bottom: 2rem; border: 1px solid #bfdbfe; font-size: 0.875rem; line-height: 1.25rem;">
            <p> "Get ready to experience the convenience of Blinkit. We deliver groceries, essentials, and more, super-fast!" </p>
            <p style="margin-top: 0.5rem;"> "Explore our wide selection, enjoy lightning-fast deliveries (within 10 minutes in some areas), and discover exclusive deals and offers." </p>
        </div>

        <p style="margin-top: 2rem; font-size: 0.875rem; line-height: 1.25rem; color: #6b7280;">
            Thanks,<br>The Company Team
        </p>
        
    </div>

</body>
      </html>
    `;
  };
  
  export default verifyEmailTemplate;
  