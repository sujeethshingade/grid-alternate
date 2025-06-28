"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    FolderOpen,
    Users,
    UserPlus,
    Shield,
    Activity,
    PlayCircle,
    Trash2,
    Mail,
    Layers,
} from "lucide-react";

const sidebarItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        isActive: false,
    },
    {
        title: "All Files",
        icon: FolderOpen,
        isActive: true,
    },
    {
        title: "Manage Shared Users",
        icon: Users,
        isActive: false,
    },
    {
        title: "Members",
        icon: UserPlus,
        isActive: false,
    },
    {
        title: "Folder Permission",
        icon: Shield,
        isActive: false,
    },
    {
        title: "Activity",
        icon: Activity,
        isActive: false,
    },
    {
        title: "Training Videos",
        icon: PlayCircle,
        isActive: false,
    },
    {
        title: "Recycle Bin",
        icon: Trash2,
        isActive: false,
    },
    {
        title: "Email Configuration",
        icon: Mail,
        isActive: false,
    },
    {
        title: "Application",
        icon: Layers,
        isActive: false,
    },
];

export function AppSidebar() {
    return (
        <Sidebar variant="sidebar" className="w-44">
            <SidebarHeader>
                <div>
                    <span className="text-4xl font-bold px-2">VAULT</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                        <SidebarMenu>
                            {sidebarItems.map((item) => (
                                <SidebarMenuItem key={item.title} className="px-2">
                                    <SidebarMenuButton
                                        isActive={item.isActive}
                                        tooltip={item.title}
                                        className="text-xs"
                                    >
                                        <item.icon className="h-4 w-4"/>
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}
