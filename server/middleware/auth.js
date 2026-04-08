import jwt from 'jsonwebtoken';

const auth = async (request, response, next) => {
  try {
    let token = null;

    // Try to get token from cookie
    if (request.cookies && request.cookies.accessToken) {
      token = request.cookies.accessToken;
    }

    // Try to get token from Authorization header
    if (!token && request.headers.authorization) {
      const authHeader = request.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return response.status(401).json({
        message: 'You have not login',
        error: true,
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

    if (!decode) {
      return response.status(401).json({
        message: 'unauthorized access',
        error: true,
        success: false,
      });
    }

    request.userId = decode.id;
    next();
  } catch (error) {
    return response.status(401).json({
      message: 'You have not login',
      error: true,
      success: false,
    });
  }
};

export default auth; // ✅ This is the fix you needed
