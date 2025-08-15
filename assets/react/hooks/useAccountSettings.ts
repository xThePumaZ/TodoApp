import * as React from "react";

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export function useAccountSettings() {
    const [activeTab, setActiveTab] = React.useState<string>("profile");
    const [successMessage, setSuccessMessage] = React.useState<string>("");
    const [errorMessage, setErrorMessage] = React.useState<string>("");
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    // Initialize tab from URL parameters
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');

        if (tabParam === 'password') {
            setActiveTab('password');
        }
    }, []);

    // Handle profile image click
    const handleImageClick = (): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle file input change
    const handleFileInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        handleImageChange: (file: File) => void
    ): void => {
        if (e.target.files && e.target.files[0]) {
            handleImageChange(e.target.files[0]);
        }
    };

    // Handle profile image save
    const handleProfileImageSave = async (
        uploadProfilePicture: () => Promise<{ success: boolean; message: string }>
    ): Promise<void> => {
        const result = await uploadProfilePicture();
        if (result.success) {
            setSuccessMessage(result.message);
            setErrorMessage("");
        } else {
            setErrorMessage(result.message);
            setSuccessMessage("");
        }

        // Clear messages after 3 seconds
        setTimeout(() => {
            setSuccessMessage("");
            setErrorMessage("");
        }, 3000);
    };

    // Handle password input changes
    const handlePasswordInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        handlePasswordChange: (field: keyof PasswordData, value: string) => void
    ): void => {
        const { id, value } = e.target;
        handlePasswordChange(id as keyof PasswordData, value);
    };

    // Handle password form submission
    const handlePasswordSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
        changePassword: () => Promise<{ success: boolean; message: string }>
    ): Promise<void> => {
        e.preventDefault();

        const result = await changePassword();
        if (result.success) {
            setSuccessMessage(result.message);
            setErrorMessage("");
        } else {
            setErrorMessage(result.message);
            setSuccessMessage("");
        }

        // Clear messages after 3 seconds
        setTimeout(() => {
            setSuccessMessage("");
            setErrorMessage("");
        }, 3000);
    };

    return {
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
    };
}
