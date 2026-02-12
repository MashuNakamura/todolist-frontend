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

    const items = [
        { title: "Dashboard", url: "/", icon: Home },
        { title: "Calendar", url: "/calendar", icon: Calendar },
        { title: "Categories", url: "/categories", icon: Layers },
        { title: "All Tasks", url: "/tasks", icon: ListTodo },
        { title: "Settings", url: "/settings", icon: Settings },
    ];
</script>

<Sidebar>
    <SidebarContent>
        <SidebarGroup>
            <SidebarGroupLabel>Mashu Todo</SidebarGroupLabel>
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
