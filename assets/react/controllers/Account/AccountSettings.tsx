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

export default function AccountSettings() {
    // Get the tab from URL query parameter
    const [activeTab, setActiveTab] = React.useState<string>("profile");

    React.useEffect(() => {
        // Check if URL has a tab parameter
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');

        // Set active tab if valid
        if (tabParam === 'password') {
            setActiveTab('password');
        }
    }, []);

    // State for profile information
    const [profileImage, setProfileImage] = React.useState<string>(
        "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/ct-assets/team-4.jpg"
    );
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    // State for password change
    const [passwordData, setPasswordData] = React.useState<PasswordData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // State for validation errors
    const [errors, setErrors] = React.useState<ErrorState>({
        currentPassword: null,
        newPassword: null,
        confirmPassword: null,
    });
    const [successMessage, setSuccessMessage] = React.useState<string>("");

    // Handle profile image change
    const handleImageClick = (): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // Create a preview of the image
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>): void => {
                if (event.target && event.target.result) {
                    setProfileImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle profile image save
    const handleProfileImageSave = (): void => {
        if (!imageFile) {
            return;
        }

        // Create form data for the image upload
        const formData = new FormData();
        formData.append('profileImage', imageFile);

        // Send the image to the server
        fetch('/api/user/profile-image', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Failed to upload profile image');
                    });
                }
                return response.json();
            })
            .then(data => {
                // Show success message
                setSuccessMessage(data.message || "Profile picture updated successfully!");

                // Reset the image file state since it's been uploaded
                setImageFile(null);

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            })
            .catch(error => {
                // Show error message
                setSuccessMessage(error.message);

                // Clear error message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            });
    };

    // Handle password input changes
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const {id, value} = e.target;
        setPasswordData({
            ...passwordData,
            [id]: value,
        });

        // Clear error when user types
        if (errors[id]) {
            setErrors({
                ...errors,
                [id]: null,
            });
        }
    };

    // Validate password form
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
        // Check if there are any error messages
        return !Object.values(newErrors).some(error => error !== null);
    };

    // Handle password form submission
    const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            return;
        }

        // Send password change request to the server
        fetch('/api/user/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            }),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Failed to change password');
                    });
                }
                return response.json();
            })
            .then(data => {
                // Reset form
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });

                // Show success message
                setSuccessMessage(data.message || "Password changed successfully!");

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            })
            .catch(error => {
                // Show error message
                setErrors({
                    ...errors,
                    currentPassword: error.message,
                });
            });
    };

    return (
        <Card className="w-full shadow-none">
            <CardHeader
                color="transparent"
                floated={false}
                shadow={false}
                className="m-0 p-4 border-b border-gray-200">
                <Tabs defaultValue="profile" value={activeTab} orientation="horizontal"
                      className="relative flex shrink-0 flex-col data-[orientation=horizontal]:flex-col data-[orientation=vertical]:flex-col rounded-md p-1 bg-surface-light dark:bg-surface w-full">
                    <Tabs.List className="relative z-0 bg-gray-100 w-full">
                        <Tabs.Trigger
                            value="profile"
                            className="inline-flex relative z-[2] py-1.5 px-3 items-center justify-center align-middle text-black dark:text-white select-none font-sans font-medium text-center text-sm aria-disabled:opacity-50 aria-disabled:pointer-events-none w-full data-[active=true]:bg-gray-200"
                            onClick={() => setActiveTab("profile")}
                        >
                            <ProfileCircle className="mr-2 h-4 w-4"/>
                            User Profile
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="password"
                            className="inline-flex relative z-[2] py-1.5 px-3 items-center justify-center align-middle text-black dark:text-white select-none font-sans font-medium text-center text-sm aria-disabled:opacity-50 aria-disabled:pointer-events-none w-full data-[active=true]:bg-gray-200"
                            onClick={() => setActiveTab("password")}
                        >
                            <Key className="mr-2 h-4 w-4"/>
                            Password
                        </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Panel value="profile" className="p-1 w-full block">
                        <CardBody className="p-4">
                            {successMessage && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                                    {successMessage}
                                </div>
                            )}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative mb-4 group">
                                    <Avatar
                                        src={profileImage}
                                        alt="Profile"
                                        size="md"
                                        className="cursor-pointer border-2 border-gray-200 max-h-64"
                                        onClick={handleImageClick}
                                    />
                                    <div
                                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={handleImageClick}
                                    >
                                        <Camera className="w-8 h-8 text-white"/>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <Typography variant="h6" className="mb-1">
                                    Change Profile Picture
                                </Typography>
                                <Typography className="text-gray-600 text-sm">
                                    Click on the image to upload a new profile picture
                                </Typography>
                            </div>
                            <div className="flex justify-center">
                                <Button
                                    className="mt-4 bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 active:bg-blue-700"
                                    disabled={!imageFile}
                                    onClick={handleProfileImageSave}>
                                    Save Changes
                                </Button>
                            </div>
                        </CardBody>
                    </Tabs.Panel>
                    <Tabs.Panel value="password" className="p-1 w-full block">
                        <CardBody className="p-4">
                            {successMessage && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                                    {successMessage}
                                </div>
                            )}
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="mb-4 space-y-1.5">
                                    <Typography
                                        as="label"
                                        htmlFor="currentPassword"
                                        type="small"
                                        color="default"
                                        className="font-semibold text-sm"
                                    >
                                        Current Password
                                    </Typography>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        placeholder="Enter your current password"
                                        className={`text-sm ${
                                            errors.currentPassword ? "border-red-500" : ""
                                        }`}
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                    />
                                    {errors.currentPassword && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.currentPassword}
                                        </p>
                                    )}
                                </div>
                                <div className="mb-4 space-y-1.5">
                                    <Typography
                                        as="label"
                                        htmlFor="newPassword"
                                        type="small"
                                        color="default"
                                        className="font-semibold text-sm"
                                    >
                                        New Password
                                    </Typography>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="Enter your new password"
                                        className={`text-sm ${
                                            errors.newPassword ? "border-red-500" : ""
                                        }`}
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                    />
                                    {errors.newPassword && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.newPassword}
                                        </p>
                                    )}
                                </div>
                                <div className="mb-4 space-y-1.5">
                                    <Typography
                                        as="label"
                                        htmlFor="confirmPassword"
                                        type="small"
                                        color="default"
                                        className="font-semibold text-sm"
                                    >
                                        Confirm New Password
                                    </Typography>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your new password"
                                        className={`text-sm ${
                                            errors.confirmPassword ? "border-red-500" : ""
                                        }`}
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    className="mt-4 bg-blue-500"
                                >
                                    Change Password
                                </Button>
                            </form>
                        </CardBody>
                    </Tabs.Panel>
                </Tabs>
            </CardHeader>
        </Card>
    );
}
