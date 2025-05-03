import { Avatar, AvatarFallback, AvatarImage } from "@/libs/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/libs/ui/popover";
import { IconLogout } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { SignOut } from "../auth/signout";
import { useOnboarding } from "../onboarding/onboarding.context";

export const UserCard = () => {
    const { user } = useOnboarding();

    if (!user) redirect("/login");

    return (
        <Popover>
            <PopoverTrigger>
                <div className="flex items-center gap-2 p-1.5 bg-white rounded-lg z-20">
                    <Avatar className="rounded-md w-7 h-7">
                        <AvatarImage
                            src={user?.user_metadata?.avatar_url}
                            alt="avatar"
                        />
                        <AvatarFallback className="rounded-md bg-gradient-to-br from-amber-200 to-green-300">
                            {user?.user_metadata?.full_name.split(" ")[0][0]}
                        </AvatarFallback>
                    </Avatar>

                    <span className="font-medium text-base pr-1">
                        {user?.user_metadata?.full_name.split(" ")[0]}
                    </span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="flex items-center justify-center w-[150px]">
                <SignOut className="bg-red-700">
                    <div className="flex gap-2 items-center">
                        LogOut <IconLogout size={20} />
                    </div>
                </SignOut>
            </PopoverContent>
        </Popover>
    );
};
