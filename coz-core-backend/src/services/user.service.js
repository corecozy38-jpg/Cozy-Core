import User from '../models/user.model.js';
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import RefreshToken from "../models/refreshToken.model.js";

const getUserService = async (userId) => {
    const user = await User.findById(userId);
    if (user) {
        const { password, verificationToken, verificationTokenExpires, ...cleanedUser } = user._doc;
        return cleanedUser;
    }
    return null;
}

const updateUserService = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user)
        return null;

    user.fullName = data.fullName || user.fullName;
    user.phone = data.phone || user.phone;
    await user.save();

    const { password, verificationToken, verificationTokenExpires, ...cleanedUser } = user._doc;
    return cleanedUser;
}

const getAddressesService = async (userId) => {
    const user = await User.findById(userId).select('address');
    return user?.address || [];
};

const addAddressesService = async (userId, addressesArray) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const newAddresses = addressesArray.map(addr => ({
        governorate: addr.governorate,
        city: addr.city,
        street: addr.street,
        apartment: addr.apartment || null,
        postalCode: addr.postalCode || null,
        country: addr.country || 'Egypt'
    }));

    user.address.push(...newAddresses);
    await user.save();

    const addedAddresses = user.address.slice(-newAddresses.length);
    return addedAddresses;
};

const updateAddressService = async (userId, addressId, updateData) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const address = user.address.id(addressId);
    if (!address) throw new Error('Address not found');

    address.governorate = updateData.governorate || address.governorate;
    address.city = updateData.city || address.city;
    address.street = updateData.street || address.street;
    address.apartment = updateData.apartment || address.apartment;
    address.postalCode = updateData.postalCode || address.postalCode;
    address.country = updateData.country || address.country;


    await user.save();
    return address;
};

const deleteAddressService = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const address = user.address.id(addressId);
    if (!address) throw new Error('Address not found');

    user.address.pull({ _id: addressId });  
    await user.save();

    return { 
        message: 'Address removed successfully' 
    };
};


const getAllUsersService = async (page, limit, search) => {
    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
        filter.$or = [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }

    const users = await User.find(filter)
        .select("-password -verificationToken -verificationTokenExpires -resetOTP -resetOTPExpires")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const usersWithOrderCount = await Promise.all(
        users.map(async (user) => {
            const orderCount = await Order.countDocuments({ user: user._id });
            return { ...user, orderCount };
        })
    );

    return {
        users: usersWithOrderCount,
        total,
        totalPages,
        currentPage: page,
        limit
    };
};

const getUserByIdService = async (userId) => {
    const user = await User.findById(userId)
        .select("-password -verificationToken -verificationTokenExpires -resetOTP -resetOTPExpires")
        .lean();
    if (!user) throw new Error("User not found");
    return user;
};

const updateUserRoleService = async (userId, newRole, currentAdminId) => {
    if (userId === currentAdminId) {
        throw new Error("You cannot change your own role");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (user.role === newRole) {
        throw new Error(`User is already ${newRole}`);
    }

    user.role = newRole;
    await user.save();
    return user;
};

const deleteUserService = async (userId, currentAdminId) => {
    if (userId === currentAdminId) {
        throw new Error("You cannot delete your own account");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    await Order.deleteMany({ user: userId });
    await Review.deleteMany({ user: userId });
    await RefreshToken.deleteMany({ user: userId });

    await user.deleteOne();
    return { message: "User deleted successfully" };
};


export {
    getUserService,
    updateUserService,
    getAddressesService,
    addAddressesService,
    updateAddressService,
    deleteAddressService,
    getAllUsersService,
    deleteUserService,
    updateUserRoleService,
    getUserByIdService
}