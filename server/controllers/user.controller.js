import sendEmail from '../config/sendEmail.js'
import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import genertedRefreshToken from '../utils/generatedRefreshToken.js'
import uploadImageClodinary from '../utils/uploadImageClodinary.js'
import generatedOtp from '../utils/generatedOtp.js'
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'
import jwt from 'jsonwebtoken'

const OTP_TTL_MS = 5 * 60 * 1000;      // 5 minutes
const RESEND_WINDOW_MS = 45 * 1000;    // throttle: 45s

const COOKIE_OPTS = { httpOnly: true, secure: true, sameSite: "None" };

export async function registerUserController(request, response) {
  try {
    // Destructure required fields from request body
    const {
      name,
      email,
      password,
      mobile,
      avatar,
      date_of_birth,
      gender,
      language_preference
    } = request.body;

    // Basic validation: Check for required fields (name, email, password)
    if (!name || !email || !password) {
      return response.status(400).json({
        message: "Please provide name, email, and password",
        error: true,
        success: false
      });
    }

    // Check if email already exists
    const user = await UserModel.findOne({ email });

    if (user) {
      return response.json({
        message: "Email is already registered",
        error: true,
        success: false
      });
    }

    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    // Prepare the payload (with optional fields)
    const payload = {
      name,
      email,
      password: hashPassword,
      ...(mobile && { mobile }),
      ...(avatar && { avatar }),
      ...(date_of_birth && { date_of_birth }),
      ...(gender && { gender }),
      ...(language_preference && { language_preference })
    };

    // Create a new user instance and save to the database
    const newUser = new UserModel(payload);
    const save = await newUser.save();

    // Send success response
    return response.json({
      message: "User registered successfully.",
      error: false,
      success: true,
      data: {
        _id: save?._id,
        name: save?.name,
        email: save?.email,
      } // Return selected user data
    });

  } catch (error) {
    console.error("Error during user registration:", error);
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

export async function verifyEmailController(request,response){
    try {
        const { code } = request.body

        const user = await UserModel.findOne({ _id : code})

        if(!user){
            return response.status(400).json({
                message : "Invalid code",
                error : true,
                success : false
            })
        }

        const updateUser = await UserModel.updateOne({ _id : code },{
            verify_email : true
        })

        return response.json({
            message : "Verify email done",
            success : true,
            error : false
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : true
        })
    }
}

//login controller
export async function loginController(request, response) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Provide email and password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return response.status(400).json({
        message: "User not registered",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Contact Admin",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return response.status(400).json({
        message: "Incorrect password",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(user._id);
    const refreshToken = await genertedRefreshToken(user._id);

    const userAgent = request.headers['user-agent'] || "Unknown Device";
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress || "Unknown IP";

    // 👉 Update login info (push to login_history + update login date + agent)
    await UserModel.findByIdAndUpdate(user._id, {
      $set: {
        last_login_date: new Date(),
        last_login_agent: `${userAgent} - ${ip}`
      },
      $push: {
        login_history: {
          ip,
          device: userAgent,
          date: new Date()
        }
      }
    });

    const cookiesOption = { httpOnly: true, secure: true, sameSite: "None" };
    response.cookie("accessToken", accesstoken, cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);

    return response.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
          mobile: user.mobile || null,
          role: user.role || "User",
          gender: user.gender || null,
          date_of_birth: user.date_of_birth || null,
          last_login_date: user.last_login_date || null,
          last_login_agent: `${userAgent} - ${ip}`,
          language_preference: user.language_preference || "en",
          wallet_balance: user.wallet_balance || 0
        },
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

//logout controller
export async function logoutController(request, response) {
  try {
    const userId = request.userId;

    // Optionally clear cookie for web users
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    };
    response.clearCookie("accessToken", cookiesOption);
    response.clearCookie("refreshToken", cookiesOption);

    // Remove refresh token from DB
    await UserModel.findByIdAndUpdate(userId, { refresh_token: "" });

    return response.json({
      message: "Logout successful",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//upload user avatar
export async  function uploadAvatar(request,response){
    try {
        const userId = request.userId // auth middlware
        const image = request.file  // multer middleware

        const upload = await uploadImageClodinary(image)
        
        const updateUser = await UserModel.findByIdAndUpdate(userId,{
            avatar : upload.url
        })

        return response.json({
            message : "upload profile",
            success : true,
            error : false,
            data : {
                _id : userId,
                avatar : upload.url
            }
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//update user details
export async function updateUserDetails(request, response) {
  try {
    const userId = request.userId; // From auth middleware
    const {
      name,
      email,
      mobile,
      password,
      date_of_birth,
      gender,
      language_preference,
      wallet_balance
    } = request.body;

    let hashPassword = "";

    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    }

    const updateFields = {
      ...(name && { name }),
      ...(email && { email }),
      ...(mobile && { mobile }),
      ...(password && { password: hashPassword }),
      ...(date_of_birth && { date_of_birth }),
      ...(gender && { gender }),
      ...(language_preference && { language_preference }),
      ...(wallet_balance !== undefined && { wallet_balance }) // allow 0
    };

    const updateUser = await UserModel.updateOne({ _id: userId }, updateFields);

    return response.json({
      message: "Updated successfully",
      error: false,
      success: true,
      data: updateUser
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

//forgot password not login
export async function forgotPasswordController(request,response) {
    try {
        const { email } = request.body 

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const otp = generatedOtp()
        const expireTime = new Date() + 60 * 60 * 1000 // 1hr

        const update = await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp : otp,
            forgot_password_expiry : new Date(expireTime).toISOString()
        })

        await sendEmail({
            sendTo : email,
            subject : "Forgot password from Binkeyit",
            html : forgotPasswordTemplate({
                name : user.name,
                otp : otp
            })
        })

        return response.json({
            message : "check your email",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//verify forgot password otp
export async function verifyForgotPasswordOtp(request,response){
    try {
        const { email , otp }  = request.body

        if(!email || !otp){
            return response.status(400).json({
                message : "Provide required field email, otp.",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const currentTime = new Date().toISOString()

        if(user.forgot_password_expiry < currentTime  ){
            return response.status(400).json({
                message : "Otp is expired",
                error : true,
                success : false
            })
        }

        if(otp !== user.forgot_password_otp){
            return response.status(400).json({
                message : "Invalid otp",
                error : true,
                success : false
            })
        }

        //if otp is not expired
        //otp === user.forgot_password_otp

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_otp : "",
            forgot_password_expiry : ""
        })
        
        return response.json({
            message : "Verify otp successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//reset the password
export async function resetpassword(request, response) {
  try {
    const { email, newPassword, confirmPassword } = request.body;

    if (!email || !newPassword || !confirmPassword) {
      return response.status(400).json({
        message: "Provide required fields: email, newPassword, confirmPassword"
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return response.status(400).json({
        message: "Email is not available",
        error: true,
        success: false
      });
    }

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "New password and confirm password must be the same.",
        error: true,
        success: false
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    // ✅ Recommended way
    user.password = hashPassword;
    await user.save();

    return response.json({
      message: "Password updated successfully.",
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

//refresh token controler
export async function refreshToken(request,response){
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if(!refreshToken){
            return response.status(401).json({
                message : "Invalid token",
                error  : true,
                success : false
            })
        }

        const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)

        if(!verifyToken){
            return response.status(401).json({
                message : "token is expired",
                error : true,
                success : false
            })
        }

        const userId = verifyToken?._id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.cookie('accessToken',newAccessToken,cookiesOption)

        return response.json({
            message : "New Access token generated",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//get login user details
export async function userDetails(request,response){
    try {
        const userId  = request.userId

        console.log(userId)

        const user = await UserModel.findById(userId).select('-password -refresh_token')

        return response.json({
            message : 'user details',
            data : user,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : "Something is wrong",
            error : true,
            success : false
        })
    }
}

// --- Mobile OTP: SEND ---
export async function sendLoginOtpController(req, res) {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ message: "Provide mobile", error: true, success: false });
    }

    const raw = String(mobile).trim();
    const digits = raw.replace(/\D/g, "");
    if (!digits || digits.length < 8) {
      return res.status(400).json({ message: "Invalid mobile format", error: true, success: false });
    }

    const regex = `${digits}$`;
    const user = await UserModel.findOne({
      $expr: { $regexMatch: { input: { $toString: "$mobile" }, regex } }
    });

    if (!user) {
      return res.status(404).json({ message: "User not registered", error: true, success: false });
    }

    if (user.status !== "Active") {
      return res.status(403).json({ message: "Contact Admin", error: true, success: false });
    }

    const otp = String(generatedOtp()); // ✅ convert to string
    const salt = await bcryptjs.genSalt(10);
    const otpHash = await bcryptjs.hash(otp, salt);

    await UserModel.findByIdAndUpdate(user._id, {
      mobile_login_otp_hash: otpHash,
      mobile_login_otp_expiry: new Date(Date.now() + OTP_TTL_MS),
      mobile_login_last_sent_at: new Date()
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Login OTP for ${raw}: ${otp}`);
    }

    return res.json({ message: "OTP sent", error: false, success: true });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// --- Mobile OTP: VERIFY ---
export async function verifyLoginOtpController(req, res) {
  try {
    const body = req.body || {};                // ← safe guard
    const { mobile, otp } = body;               // ← no crash if undefined

    if (!mobile || !otp) {
      return res.status(400).json({
        message: "Provide mobile and otp",
        error: true,
        success: false
      });
    }

    const raw = String(mobile).trim();
    const digits = raw.replace(/\D/g, "");
    if (!digits || digits.length < 8) {
      return res.status(400).json({ message: "Invalid mobile format", error: true, success: false });
    }

    const regex = `${digits}$`;
    const user = await UserModel.findOne({
      $expr: { $regexMatch: { input: { $toString: "$mobile" }, regex } }
    });

    if (!user || !user.mobile_login_otp_hash || !user.mobile_login_otp_expiry) {
      return res.status(400).json({ message: "OTP not requested or user not found", error: true, success: false });
    }
    if (user.status !== "Active") {
      return res.status(403).json({ message: "Contact Admin", error: true, success: false });
    }

    if (user.mobile_login_otp_expiry.getTime() < Date.now()) {
      await UserModel.findByIdAndUpdate(user._id, { mobile_login_otp_hash: null, mobile_login_otp_expiry: null });
      return res.status(400).json({ message: "OTP expired", error: true, success: false });
    }

    const isValid = await bcryptjs.compare(String(otp).trim(), user.mobile_login_otp_hash);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP", error: true, success: false });
    }

    await UserModel.findByIdAndUpdate(user._id, { mobile_login_otp_hash: null, mobile_login_otp_expiry: null });

    const accesstoken = await generatedAccessToken(user._id);
    const refreshToken = await genertedRefreshToken(user._id);

    const userAgent = req.headers['user-agent'] || "Unknown Device";
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Unknown IP";

    await UserModel.findByIdAndUpdate(user._id, {
      $set: { last_login_date: new Date(), last_login_agent: `${userAgent} - ${ip}` },
      $push: { login_history: { ip, device: userAgent, date: new Date() } }
    });

    res.cookie("accessToken", accesstoken, { httpOnly: true, secure: true, sameSite: "None" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "None" });

    return res.json({
      message: "Login successful",
      error: false,
      success: true,
      data: { accesstoken, refreshToken }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error", error: true, success: false });
  }
}



// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE 3 CONTROLLERS TO user.controller.js
// (Replace your existing notifyMeController too — it's improved below)
// ─────────────────────────────────────────────────────────────────────────────


// 🔔 NOTIFY ME — subscribe (improved: prevents duplicate cleanly)
export async function notifyMeController(req, res) {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required", error: true, success: false });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", error: true, success: false });
    }

    const alreadySubscribed = user.notify_products?.some(
      (id) => id.toString() === productId.toString()
    );

    if (alreadySubscribed) {
      return res.json({
        message: "Already subscribed for this product",
        notified: true,
        success: true,
        error: false,
      });
    }

    await UserModel.findByIdAndUpdate(userId, {
      $push: { notify_products: productId },
    });

    return res.json({
      message: "You will be notified when product is back in stock",
      notified: true,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
}


// 🔕 REMOVE NOTIFY ME — unsubscribe
export async function removeNotifyMeController(req, res) {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required", error: true, success: false });
    }

    await UserModel.findByIdAndUpdate(userId, {
      $pull: { notify_products: productId },
    });

    return res.json({
      message: "Notification removed successfully",
      notified: false,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
}


// 📋 GET NOTIFY STATUS — check if user is subscribed for a product
export async function getNotifyStatusController(req, res) {
  try {
    const userId = req.userId;
    const { productId } = req.query; // GET /notify-status?productId=xxx

    if (!productId) {
      return res.status(400).json({ message: "Product ID required", error: true, success: false });
    }

    const user = await UserModel.findById(userId).select("notify_products");
    if (!user) {
      return res.status(404).json({ message: "User not found", error: true, success: false });
    }

    const notified = user.notify_products?.some(
      (id) => id.toString() === productId.toString()
    );

    return res.json({
      message: "Notify status fetched",
      notified,       // true or false — use this directly in the app
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
}