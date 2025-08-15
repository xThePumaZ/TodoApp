import * as React from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
    Input,
    Tabs,
    Avatar,
} from "@material-tailwind/react";
import {UserCircle, Camera, Key, SelectFace3d, Settings, ProfileCircle} from "iconoir-react";
import { apiService, ApiError } from "../../services/apiService";
import { useAccountSettings } from "../../hooks/useAccountSettings";


// Define types for our state
interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ErrorState {
    currentPassword: string | null;
    newPassword: string | null;
    confirmPassword: string | null;
}


// Custom hook for profile picture management
function useProfilePicture() {
    const [profilePicture, setProfilePicture] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);

    React.useEffect(() => {
        loadProfilePicture();
    }, []);

    const loadProfilePicture = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.loadProfilePicture();
            setProfilePicture(response.data[0]);
        } catch (error) {
            console.error("Failed to load profile picture:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (file: File) => {
        setImageFile(file);

        // Create a preview of the image
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (event.target && event.target.result) {
                setProfilePicture(event.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const uploadProfilePicture = async (): Promise<{ success: boolean; message: string }> => {
        if (!imageFile) {
            return { success: false, message: "No image file selected" };
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('profileImage', imageFile);

            const response = await apiService.changeProfilePicture(formData);
            setImageFile(null);

            return { success: true, message: response.message || "Profile picture updated successfully!" };
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : 'An error occurred while uploading the profile image';
            return { success: false, message: errorMessage };
        } finally {
            setIsUploading(false);
        }
    };

    return {
        profilePicture,
        isLoading,
        imageFile,
        isUploading,
        handleImageChange,
        uploadProfilePicture,
    };
}

// Custom hook for password management
function usePasswordChange(csrfToken: string) {
    const [passwordData, setPasswordData] = React.useState<PasswordData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = React.useState<ErrorState>({
        currentPassword: null,
        newPassword: null,
        confirmPassword: null,
    });

    const [isChanging, setIsChanging] = React.useState(false);

    const handlePasswordChange = (field: keyof PasswordData, value: string) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null,
            }));
        }
    };

    const validatePasswordForm = (): boolean => {
        const newErrors: ErrorState = {
            currentPassword: null,
            newPassword: null,
            confirmPassword: null,
        };

        if (!passwordData.currentPassword.trim()) {
            newErrors.currentPassword = "Current password is required";
        }

        if (!passwordData.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
        } else if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
        }

        if (!passwordData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your new password";
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== null);
    };

    const changePassword = async (): Promise<{ success: boolean; message: string }> => {
        if (!validatePasswordForm()) {
            return { success: false, message: "Please fix the validation errors" };
        }

        try {
            setIsChanging(true);
            const response = await apiService.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword,
                passwordData.confirmPassword,
                csrfToken
            );

            // Reset form on success
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            return { success: true, message: response.message || "Password changed successfully!" };
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : 'Failed to change password';

            // Set error on current password field for API errors
            setErrors(prev => ({
                ...prev,
                currentPassword: errorMessage,
            }));

            return { success: false, message: errorMessage };
        } finally {
            setIsChanging(false);
        }
    };

    return {
        passwordData,
        errors,
        isChanging,
        handlePasswordChange,
        changePassword,
    };
}

interface AccountSettingsProps {
    csfr_token: string;
}

export default function AccountSettings({ csfr_token }: AccountSettingsProps) {
    const {
        profilePicture,
        isLoading,
        imageFile,
        isUploading,
        handleImageChange,
        uploadProfilePicture
    } = useProfilePicture();

    const {
        passwordData,
        errors,
        isChanging,
        handlePasswordChange,
        changePassword,
    } = usePasswordChange(csfr_token);

    const {
        activeTab,
        setActiveTab,
        successMessage,
        errorMessage,
        fileInputRef,
        handleImageClick,
        handleFileInputChange,
        handleProfileImageSave,
        handlePasswordInputChange,
        handlePasswordSubmit,
    } = useAccountSettings();


    return (
        <Card className="w-full shadow-none bg-gray-100 dark:bg-gray-500">
            <CardHeader
                color="transparent"
                className="m-0 p-3 sm:p-4 border-b border-gray-300">
                <Tabs defaultValue="profile" value={activeTab} orientation="horizontal"
                      className="relative flex shrink-0 flex-col data-[orientation=horizontal]:flex-col data-[orientation=vertical]:flex-col rounded-md p-1 bg-surface-light dark:bg-surface w-full">
                        <Tabs.List className="relative z-0 bg-gray-300 w-full">
                        <Tabs.Trigger
                            value="profile"
                            className="inline-flex relative z-[2] py-3 sm:py-1.5 px-4 sm:px-3 items-center justify-center align-middle text-black dark:text-black select-none font-sans font-medium text-center text-base sm:text-sm aria-disabled:opacity-50 aria-disabled:pointer-events-none w-full data-[active=true]:bg-gray-200 cursor-pointer"
                            onClick={() => setActiveTab("profile")}
                        >
                            <ProfileCircle className="mr-2 sm:mr-2 h-5 w-5 sm:h-4 sm:w-4"/>
                            User Profile
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="password"
                            className="inline-flex relative z-[2] py-3 sm:py-1.5 px-4 sm:px-3 items-center justify-center align-middle text-black dark:text-black select-none font-sans font-medium text-center text-base sm:text-sm aria-disabled:opacity-50 aria-disabled:pointer-events-none w-full data-[active=true]:bg-gray-200 cursor-pointer"
                            onClick={() => setActiveTab("password")}
                        >
                            <Key className="mr-2 sm:mr-2 h-5 w-5 sm:h-4 sm:w-4"/>
                            Password
                        </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Panel value="profile" className="p-1 w-full block">
                        <CardBody className="p-4 sm:p-4">
                            {successMessage && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm sm:text-base">
                                    {successMessage}
                                </div>
                            )}
                            <div className="flex flex-col items-center mb-6 sm:mb-6">
                                <div className="relative mb-4 sm:mb-4 group">
                                    {!isLoading && (
                                        <Avatar
                                            src={profilePicture}
                                            alt="Profile"
                                            size="lg"
                                            className="cursor-pointer border-2 border-gray-200 rounded-full max-h-32 sm:max-h-64 flex items-start"
                                            onClick={handleImageClick}/>
                                    )}
                                    <div
                                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={handleImageClick}
                                    >
                                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white"/>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileInputChange(e, handleImageChange)}
                                    />
                                </div>
                                <Typography variant="h6" className="mb-2 sm:mb-1 text-black dark:text-gray-50 text-lg sm:text-xl text-center">
                                    Change Profile Picture
                                </Typography>
                                <Typography className="text-black dark:text-gray-100 text-sm sm:text-sm text-center px-4 sm:px-0">
                                    Click on the image to upload a new profile picture
                                </Typography>
                            </div>
                            <div className="flex justify-center">
                                <Button
                                    className="mt-4 bg-blue-400 text-white hover:bg-blue-600 focus:bg-blue-600 active:bg-blue-700 dark:text-white py-3 px-6 sm:py-2 sm:px-4 text-base sm:text-sm"
                                    disabled={!imageFile || isUploading}
                                    onClick={() => handleProfileImageSave(uploadProfilePicture)}>
                                    {isUploading ? "Uploading..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardBody>
                    </Tabs.Panel>
                    <Tabs.Panel value="password" className="p-1 w-full block">
                        <CardBody className="p-4 sm:p-4">

                            {errorMessage && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm sm:text-base">
                                    {errorMessage}
                                </div>
                            )}

                            {successMessage && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm sm:text-base">
                                    {successMessage}
                                </div>
                            )}
                            <form onSubmit={(e) => handlePasswordSubmit(e, changePassword)} className="space-y-5 sm:space-y-4">
                                <div className="space-y-2">
                                    <Typography
                                        as="label"
                                        htmlFor="currentPassword"
                                        type="small"
                                        color="default"
                                        className="font-semibold text-base text-black dark:text-gray-50"
                                    >
                                        Current Password
                                    </Typography>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        placeholder="Enter your current password"
                                        className={`text-base sm:text-sm text-black dark:text-gray-50 py-3 sm:py-2 p-2 ${
                                            errors.currentPassword ? "border-red-500" : ""
                                        }`}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => handlePasswordInputChange(e, handlePasswordChange)}
                                    />
                                    {errors.currentPassword && (
                                        <p className="text-red-500 text-sm sm:text-xs mt-1">
                                            {errors.currentPassword}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Typography
                                        as="label"
                                        htmlFor="newPassword"
                                        type="small"
                                        color="default"
                                        className="font-semibold text-base  text-black dark:text-gray-50"
                                    >
                                        New Password
                                    </Typography>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="Enter your new password"
                                        className={`text-base sm:text-sm text-black dark:text-gray-50 py-3 sm:py-2 p-2 ${
                                            errors.newPassword ? "border-red-500" : ""
                                        }`}
                                        value={passwordData.newPassword}
                                        onChange={(e) => handlePasswordInputChange(e, handlePasswordChange)}
                                    />
                                    {errors.newPassword && (
                                        <p className="text-red-500 text-sm sm:text-xs mt-1">
                                            {errors.newPassword}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Typography
                                        as="label"
                                        htmlFor="confirmPassword"
                                        type="small"
                                        color="default"
                                        className="font-semibold text-base text-black dark:text-gray-50"
                                    >
                                        Confirm New Password
                                    </Typography>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your new password"
                                        className={`text-base sm:text-sm text-black dark:text-gray-50 py-3 sm:py-2 p-2 ${
                                            errors.confirmPassword ? "border-red-500" : ""
                                        }`}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => handlePasswordInputChange(e, handlePasswordChange)}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm sm:text-xs mt-1">
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isChanging}
                                    className="mt-6 sm:mt-4 bg-blue-400 text-white hover:bg-blue-600 focus:bg-blue-600 active:bg-blue-700 dark:text-white py-3 px-6 sm:py-2 sm:px-4 text-base sm:text-sm w-full sm:w-auto">
                                    {isChanging ? "Changing Password..." : "Change Password"}
                                </Button>
                            </form>
                        </CardBody>
                    </Tabs.Panel>
                </Tabs>
            </CardHeader>
        </Card>
    );
}
