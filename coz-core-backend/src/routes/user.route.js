import { Router } from "express"
import { isAdmin, Protect } from "../middlewares/auth.middleware.js";
import { getUserProfile , updateUserProfile  , addAddresses , updateAddress , deleteAddress, getAddresses, getAllUsers, getUserById, updateUserRole, deleteUser } from "../controllers/user.controller.js";

const router = Router();

router.get("/profile", Protect, getUserProfile);
router.put("/profile", Protect, updateUserProfile);
router.route('/addresses')
    .get(Protect, getAddresses)
    .post(Protect, addAddresses);

router.route('/addresses/:addressId')
    .put( Protect,updateAddress)
    .delete( Protect,deleteAddress);


router.use(Protect, isAdmin);

router.get("/admin", getAllUsers);
router.get("/admin/:userId", getUserById);
router.put("/admin/:userId/role", updateUserRole);
router.delete("/admin/:userId", deleteUser);

export default router