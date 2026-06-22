export interface Address{
    country:string,
    governorate: string,
    city: string,
    street: string,
    apartment?: string | null ,
    postalCode?: string | null ,
}

export interface AddressWithId extends Address {
  _id: string;
}

export interface User{
  _id:string,
  fullName:string,
  email:string,
  role:string,
  address:Address[],
  phone: string,
  createdAt?:Date,
}

export interface RegisterBody {
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone: string,
    address:Address[]
}


export interface LoginBody {
    email:string ,
    password:string
}

export interface LoginResponse {
    user:User,
    accessToken:string,
    refreshToken:string,
    priceChangedItems:any[]
}
export interface RegisterResponse {
    user:User,
    priceChangedItems:any[]
}



export interface changePasswordBody{
  currentPassword:string,
  newPassword:string,
  confirmNewPassword:string
}

export interface forgetPasswordResponse{
  message:string,
  verificationToken:string,
  otp:string
}


export interface verfiyOTPBody{
  token:string,
  otp:string
}

export interface verifyOTPResponse{
  resetToken:string,
  message:string
}
export interface resetPasswordBody{
  token:string,
  password:string,
  confirmPassword:string
}

export interface userProfile {
  data:User,
  message:string
}


export interface AddressesListResponse {
  message: string;
  data: AddressWithId[];
}

export interface updateUserProfileBody{
  fullName?:string,
  email?:string,
  phone?:string
}
