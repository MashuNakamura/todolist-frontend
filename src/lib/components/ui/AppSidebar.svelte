<script lang="ts">
    import { page } from "$app/stores";
    import { Calendar, Home, Layers, Settings, ListTodo } from "lucide-svelte";
    import {
        Sidebar,
        SidebarContent,
        SidebarGroup,
        SidebarGroupContent,
        SidebarGroupLabel,
        SidebarMenu,
        SidebarMenuButton,
        SidebarMenuItem,
    } from "$lib/components/ui/sidebar";
    import { authService } from "$lib/services/authService";

    let name = $state("");

    const items = [
        { title: "Dashboard", url: "/", icon: Home },
        { title: "Calendar", url: "/calendar", icon: Calendar },
        { title: "Categories", url: "/categories", icon: Layers },
        { title: "All Tasks", url: "/tasks", icon: ListTodo },
        { title: "Settings", url: "/settings", icon: Settings },
    ];

    $effect(() => {
        authService.GetUserProfile().then((res) => {
            if (res.success && res.data) {
                name = res.data.name;
            } else {
                window.location.href = "/auth";
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
</Sidebar>
