import asyncHandler from 'express-async-handler';
import { getUserService , updateUserService , getAddressesService , addAddressesService , updateAddressService , deleteAddressService, deleteUserService, updateUserRoleService, getUserByIdService, getAllUsersService} from '../services/user.service.js';
import { updateUserValidator, addAddressesValidator, updateAddressValidator } from '../validators/user.validator.js';


const getUserProfile = asyncHandler(async (req, res) => {
    const userId= req.user.id;
    const user = await getUserService(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(
        { 
            message: 'User profile fetched successfully',
            data: user 
        });
});

const updateUserProfile= asyncHandler(async (req, res) => {
    const { error } = updateUserValidator(req.body);
    if(error)
        return res.status(400).json({ message: error.details[0].message });

    const userId= req.user.id;
    const user = await updateUserService(userId, req.body);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(
        { 
            message: 'User profile updated successfully',
            data: user 
        });
})

const getAddresses = asyncHandler(async (req, res) => {
    const addresses = await getAddressesService(req.user._id);
    res.status(200).json({
        message: 'Addresses fetched successfully',
        data: addresses
    });
});


const addAddresses = asyncHandler(async (req, res) => {
    const { error } = addAddressesValidator(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const userId = req.user._id;
    const addressesArray = req.body.addresses;

    const newAddresses = await addAddressesService(userId, addressesArray);

    res.status(201).json({
        message: `${newAddresses.length} address(es) added successfully`,
        data: newAddresses
    });
});


const updateAddress = asyncHandler(async (req, res) => {
    const { error } = updateAddressValidator(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const updatedAddress = await updateAddressService(req.user.id, req.params.addressId, req.body);
    res.status(200).json({
        message: 'Address updated successfully',
        data: updatedAddress
    });
});


const deleteAddress = asyncHandler(async (req, res) => {
    const result = await deleteAddressService(req.user.id, req.params.addressId);
    res.status(200).json(result);
});



const getAllUsers = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || "";

    const result = await getAllUsersService(page, limit, search);

    res.status(200).json({
        message: "Users retrieved successfully",
        data: result.users,
        pagination: {
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalUsers: result.total,
            limit: result.limit
        }
    });
});

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await getUserByIdService(userId);
    res.status(200).json({
        message: "User retrieved successfully",
        data: user
    });
});

const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    const currentAdminId = req.user._id;

    if (!role || (role !== "user" && role !== "admin")) {
        return res.status(400).json({
            message: "Role must be 'user' or 'admin'"
        });
    }

    const updatedUser = await updateUserRoleService(userId, role, currentAdminId);

    res.status(200).json({
        message: "User role updated successfully",
        data: {
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            role: updatedUser.role
        }
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentAdminId = req.user._id;

    const result = await deleteUserService(userId, currentAdminId);
    res.status(200).json(result);
});

export {
    getUserProfile,
    updateUserProfile,
    getAddresses,
    addAddresses,
    updateAddress,
    deleteAddress,
    deleteUser,
    getAllUsers,
    updateUserRole,
    getUserById
}