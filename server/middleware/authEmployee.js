import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "employee_secret_key";

const authEmployee = async (req, res, next) => {
  try {
    let token = null;

    // From cookie
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // From header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        message: "Employee not logged in",
        error: true,
        success: false
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.employee = decoded;            // full object (optional)
    req.employeeId = decoded.id;       // ✅ this is required for your controller

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized or expired token",
      error: true,
      success: false
    });
  }
};

export default authEmployee;
