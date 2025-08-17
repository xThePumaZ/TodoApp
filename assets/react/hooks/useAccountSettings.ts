import * as React from "react";
import { apiService, ApiError } from "../services/apiService";

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

    // Handle profile image save with improved error handling
    const handleProfileImageSave = async (
        uploadFunction: () => Promise<{ success: boolean; message: string }>
    ): Promise<void> => {
        try {
            setSuccessMessage("");
            setErrorMessage("");

            const result = await uploadFunction();

            if (result.success) {
                setSuccessMessage(result.message);
            } else {
                setErrorMessage(result.message);
            }

            // Clear messages after 3 seconds
            setTimeout(() => {
                setSuccessMessage("");
                setErrorMessage("");
            }, 3000);

        } catch (error) {
            const errorMsg = error instanceof ApiError ? error.message : 'Fehler beim Hochladen des Bildes';
            setErrorMessage(errorMsg);

            setTimeout(() => {
                setErrorMessage("");
            }, 3000);
        }
    };

    // Handle password input changes
    const handlePasswordInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        handlePasswordChange: (field: keyof PasswordData, value: string) => void
    ): void => {
        const { id, value } = e.target;
        handlePasswordChange(id as keyof PasswordData, value);
    };

    const handlePasswordSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
        changePasswordFunction: () => Promise<{ success: boolean; message: string }>
    ): Promise<void> => {
        e.preventDefault();

        try {
            setSuccessMessage("");
            setErrorMessage("");

            const result = await changePasswordFunction();

            if (result.success) {
                setSuccessMessage(result.message);
            } else {
                setErrorMessage(result.message);
            }

            // Clear messages after 3 seconds
            setTimeout(() => {
                setSuccessMessage("");
                setErrorMessage("");
            }, 3000);

        } catch (error) {
            const errorMsg = error instanceof ApiError ? error.message : 'Fehler beim Ändern des Passworts';
            setErrorMessage(errorMsg);

            setTimeout(() => {
                setErrorMessage("");
            }, 3000);
        }
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
