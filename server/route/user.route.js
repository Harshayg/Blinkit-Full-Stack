import { Router } from 'express'
import { forgotPasswordController, getNotifyStatusController, loginController, logoutController, notifyMeController, refreshToken, registerUserController, removeNotifyMeController, resetpassword, sendLoginOtpController, updateUserDetails, uploadAvatar, userDetails, verifyEmailController, verifyForgotPasswordOtp, verifyLoginOtpController} from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const userRouter = Router()


userRouter.post('/register',registerUserController)
userRouter.post('/verify-email',verifyEmailController)
userRouter.post('/login',loginController)
userRouter.get('/logout', auth, logoutController)
userRouter.put('/upload-avatar',auth,upload.single('avatar'),uploadAvatar)
userRouter.put('/update-user',auth,updateUserDetails)
userRouter.put('/forgot-password',forgotPasswordController)
userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOtp)
userRouter.put('/reset-password',resetpassword)
userRouter.post('/refresh-token',refreshToken)
userRouter.get('/user-details',auth,userDetails)
userRouter.post('/mobile/send-otp', sendLoginOtpController)
userRouter.post('/mobile/verify-otp', verifyLoginOtpController)
userRouter.post('/notify-me', auth, notifyMeController)
userRouter.delete('/notify-me',    auth,  removeNotifyMeController)     // unsubscribe  🔕 NEW
userRouter.get('/notify-status',   auth,  getNotifyStatusController) 

export default userRouter