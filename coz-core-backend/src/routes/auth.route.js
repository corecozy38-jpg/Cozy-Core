import { Router } from 'express';
import { register, login, changePassword, forgotPassword, verifyOTP, resetPassword, verifyEmail, deleteAccount, resendVerification } from '../controllers/auth.controller.js';
import { optionalProtect, Protect } from '../middlewares/auth.middleware.js';
import { logout, refreshAccessToken } from "../controllers/refreshToken.controller.js";

const router = Router();


router.post('/register', register);
router.post('/login',optionalProtect, login);
router.post('/change-password',Protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post("/logout", logout);
router.post("/refresh-token", refreshAccessToken);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.delete('/delete-account', Protect, deleteAccount);

export default router;



