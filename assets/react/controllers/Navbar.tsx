import * as React from "react";
import {
    Typography,
    Navbar,
    List,
    Avatar,
    Menu,
} from "@material-tailwind/react";
import {
    LogOut,
    Settings,
    UserCircle,
} from "iconoir-react";

interface ProfilePictureResponse {
    data: string[];
    message?: string;
}

function ProfileMenu() {
    const [profilePicture, setProfilePicture] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        setIsLoading(true);
        setError(null);

        fetch('/api/v1/user/loadProfilePicture', {
            method: 'GET'
        })
            .then(async response => {
                if (response.status !== 200) {
                    const data: ProfilePictureResponse = await response.json().catch(() => ({ data: [], message: 'Unknown error' }));
                    throw new Error(data.message || 'Failed to get profile image');
                }
                return response.json() as Promise<ProfilePictureResponse>;
            })
            .then(data => {
                if (data.data && data.data.length > 0) {
                    setProfilePicture(data.data[0]);
                }
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Failed to get profile image:", error.message);
                setError(error.message);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return null; // Don't render anything while loading
    }

    if (error) {
        // Fallback to default avatar on error
        console.warn("Using default avatar due to error:", error);
    }

    return (
        <Menu>
            <Menu.Trigger
                as={Avatar}
                src={profilePicture}
                alt="profile-picture"
                size="sm"
                className="border border-primary p-0.5 lg:ml-auto max-h-16 dark:border-white"
            />
            <Menu.Content
                className="min-w-48 sm:min-w-40 rounded-lg space-y-1 border border-surface bg-background p-2 sm:p-1 text-sm text-foreground shadow-xl shadow-black/[0.025] outline-none bg-white cursor-pointer">
                <Menu.Item as="a" href="/account"
                           className="w-full text-start flex items-center py-3 sm:py-1.5 px-3 sm:px-2.5 rounded align-middle select-none outline-none font-sans transition-all duration-300 ease-in aria-disabled:opacity-50 bg-transparent text-foreground hover:text-black dark:hover:text-white hover:bg-surface focus:bg-surface focus:text-black dark:focus:text-white data-[selected=true]:bg-surface data-[selected=true]:text-black dark:data-[selected=true]:text-white dark:bg-opacity-70 cursor-pointer hover:bg-gray-200 text-base sm:text-sm">
                    <UserCircle className="mr-3 sm:mr-2 h-5 w-5 sm:h-[18px] sm:w-[18px]"/> My Profile
                </Menu.Item>
                <Menu.Item as="a" href="/account?tab=password"
                           className="w-full text-start flex items-center py-3 sm:py-1.5 px-3 sm:px-2.5 rounded align-middle select-none outline-none font-sans transition-all duration-300 ease-in aria-disabled:opacity-50 bg-transparent text-foreground hover:text-black dark:hover:text-white hover:bg-surface focus:bg-surface focus:text-black dark:focus:text-white data-[selected=true]:bg-surface data-[selected=true]:text-black dark:data-[selected=true]:text-white dark:bg-opacity-70 cursor-pointer hover:bg-gray-200 text-base sm:text-sm">
                    <Settings className="mr-3 sm:mr-2 h-5 w-5 sm:h-[18px] sm:w-[18px]"/> Edit Profile
                </Menu.Item>
                <hr className="!my-2 sm:!my-1 -mx-1 border-secondary-dark"/>
                <Menu.Item as="a" href="/logout"
                    className="w-full text-start flex items-center py-3 sm:py-1.5 px-3 sm:px-2.5 rounded align-middle select-none outline-none font-sans transition-all duration-300 ease-in aria-disabled:opacity-50 aria-disabled:pointer-events-none bg-transparent dark:hover:text-white dark:focus:text-white data-[selected=true]:bg-surface data-[selected=true]:text-black dark:data-[selected=true]:text-white dark:bg-opacity-70 text-error hover:bg-error/10 hover:text-error focus:bg-error/10 focus:text-error text-red-600 cursor-pointer hover:bg-red-200 text-base sm:text-sm">
                    <LogOut className="mr-3 sm:mr-2 h-5 w-5 sm:h-[18px] sm:w-[18px]"/>
                    Logout
                </Menu.Item>
            </Menu.Content>
        </Menu>
    );
}

export default function NavbarWithMegaMenu() {

    return (
        <Navbar className="mx-auto w-full max-w-screen-xl bg-gray-200 dark:bg-gray-500 px-2 sm:px-4">
            <div className="flex items-center justify-between w-full">
                <Typography
                    as="a"
                    href="/"
                    type="small"
                    className="block py-1 font-semibold dark:text-white text-lg sm:text-xl"
                >
                    WhatsToDo
                </Typography>
                <div className="flex items-center gap-2">
                    <ProfileMenu/>
                </div>
            </div>
        </Navbar>
    );
}
