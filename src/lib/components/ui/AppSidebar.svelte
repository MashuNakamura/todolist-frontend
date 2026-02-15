<script lang="ts">
    import { page } from "$app/stores";
    import {
        Calendar,
        Home,
        Layers,
        Settings,
        ListTodo,
        LogOut,
        User as UserIcon,
    } from "lucide-svelte";
    import {
        Sidebar,
        SidebarContent,
        SidebarGroup,
        SidebarGroupContent,
        SidebarGroupLabel,
        SidebarMenu,
        SidebarMenuButton,
        SidebarMenuItem,
        SidebarFooter,
    } from "$lib/components/ui/sidebar";
    import { authService } from "$lib/services/authService";
    import { userStore } from "$lib/stores/userStore.svelte";
    import { goto } from "$app/navigation";

    let { user } = $props();

    function handleLogout() {
        authService.Logout();
        window.location.href = "/auth";
    }

    const items = [
        { title: "Dashboard", url: "/dashboard", icon: Home },
        { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
        { title: "Categories", url: "/dashboard/categories", icon: Layers },
        { title: "All Tasks", url: "/dashboard/tasks", icon: ListTodo },
        { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ];

    $effect(() => {
        authService.GetUserProfile().then((res) => {
            if (res.success && res.data) {
                userStore.setProfile(res.data);
            } else {
                goto("/auth");
            }
        });
    });
</script>

<Sidebar>
    <SidebarContent>
        <SidebarGroup>
            <SidebarGroupLabel class="h-12 px-4">
                <div class="flex items-center gap-2">
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
                    >
                        <span class="text-lg font-bold">事</span>
                    </div>

                    <div class="flex flex-col text-left leading-none">
                        <span class="font-bold text-base text-primary"
                            >Koto.</span
                        >
                        <span
                            class="text-[10px] text-muted-foreground tracking-widest"
                            >THINGS TO DO</span
                        >
                    </div>
                </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {#each items as item}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={$page.url.pathname === item.url}
                            >
                                <a
                                    href={item.url}
                                    class="flex w-full items-center gap-2"
                                >
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    {/each}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="border-t p-2">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    class="w-full justify-start gap-2 px-2 hover:bg-transparent cursor-default"
                >
                    <UserIcon class="h-4 w-4" />
                    <div class="flex flex-col items-start text-xs">
                        <span class="font-bold truncate max-w-[150px]"
                            >{userStore.profile.name || "User"}</span
                        >
                        <span class="text-muted-foreground text-[10px]"
                            >Logged in</span
                        >
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
                <SidebarMenuButton
                    onclick={handleLogout}
                    class="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-100/10 px-2 transition-colors"
                >
                    <LogOut class="h-4 w-4" />
                    <span class="font-medium">Log out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarFooter>
</Sidebar>
