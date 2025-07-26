import * as React from "react";
import {
    IconButton,
    Typography,
    Navbar,
    List,
    Avatar,
    Menu,
} from "@material-tailwind/react";
import {
    LogOut,
    Menu as MenuIcon,
    Settings,
    UserCircle,
    Xmark,
} from "iconoir-react";


function ProfileMenu() {
    const [profilePicture, setProfilePicture] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);
        fetch('/api/v1/user/profile_picture', {
            method: 'GET'
        })
            .then(async response => {
                if (response.status !== 200) {
                    const data = await response.json();
                    console.error("Failed to get profile image:", data.message);
                    throw new Error(data.message || 'Failed to get profile image');
                }
                return response.json();
            })
            .then(data => {
                if (data.profilePicture) {
                    setProfilePicture(data.profilePicture);
                }
                setIsLoading(false);
            })
    }, []);

    if (isLoading) {
        return null; // Don't render anything while loading
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
                className="min-w-40 rounded-lg space-y-0.5 border border-surface bg-background p-1 text-sm text-foreground shadow-xl shadow-black/[0.025] outline-none bg-white cursor-pointer">
                <Menu.Item as="a" href="/account"
                           className="w-full text-start flex items-center py-1.5 px-2.5 rounded align-middle select-none outline-none font-sans transition-all duration-300 ease-in aria-disabled:opacity-50 bg-transparent text-foreground hover:text-black dark:hover:text-white hover:bg-surface focus:bg-surface focus:text-black dark:focus:text-white data-[selected=true]:bg-surface data-[selected=true]:text-black dark:data-[selected=true]:text-white dark:bg-opacity-70 cursor-pointer hover:bg-gray-200">
                    <UserCircle className="mr-2 h-[18px] w-[18px]"/> My Profile
                </Menu.Item>
                <Menu.Item as="a" href="/account?tab=password"
                           className="w-full text-start flex items-center py-1.5 px-2.5 rounded align-middle select-none outline-none font-sans transition-all duration-300 ease-in aria-disabled:opacity-50 bg-transparent text-foreground hover:text-black dark:hover:text-white hover:bg-surface focus:bg-surface focus:text-black dark:focus:text-white data-[selected=true]:bg-surface data-[selected=true]:text-black dark:data-[selected=true]:text-white dark:bg-opacity-70 cursor-pointer hover:bg-gray-200">
                    <Settings className="mr-2 h-[18px] w-[18px]"/> Edit Profile
                </Menu.Item>
                <hr className="!my-1 -mx-1 border-secondary-dark"/>
                <Menu.Item
                    className="w-full text-start flex items-center py-1.5 px-2.5 rounded align-middle select-none outline-none font-sans transition-all duration-300 ease-in aria-disabled:opacity-50 aria-disabled:pointer-events-none bg-transparent dark:hover:text-white dark:focus:text-white data-[selected=true]:bg-surface data-[selected=true]:text-black dark:data-[selected=true]:text-white dark:bg-opacity-70 text-error hover:bg-error/10 hover:text-error focus:bg-error/10 focus:text-error text-red-600 cursor-pointer hover:bg-red-200">
                    <LogOut className="mr-2 h-[18px] w-[18px]"/>
                    Logout
                </Menu.Item>
            </Menu.Content>
        </Menu>
    );
}

export default function NavbarWithMegaMenu() {
    const [openNav, setOpenNav] = React.useState(false);
    React.useEffect(() => {
        window.addEventListener(
            "resize",
            () => window.innerWidth >= 960 && setOpenNav(false),
        );
    }, []);

    return (
        <Navbar className="mx-auto w-full max-w-screen-xl bg-gray-200 dark:bg-gray-500">
            <div className="flex items-center">
                <Typography
                    as="a"
                    href="/"
                    type="small"
                    className="ml-2 mr-2 block py-1 font-semibold dark:text-white "
                >
                    WhatsToDo
                </Typography>
                <IconButton
                    size="lg"
                    variant="ghost"
                    color="secondary"
                    onClick={() => setOpenNav(!openNav)}
                    className="ml-auto mr-2 grid lg:hidden dark:border-white"
                >
                    {openNav ? (
                        <Xmark className="h-4 w-4"/>
                    ) : (
                        <MenuIcon className="h-4 w-4"/>
                    )}
                </IconButton>
                <ProfileMenu/>
            </div>
        </Navbar>
    );
}
