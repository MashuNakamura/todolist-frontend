<script lang="ts">
    import { onMount } from "svelte";
    import Logo from "$lib/components/ui/Logo.svelte";
    import { goto } from "$app/navigation";
    import { authService } from "$lib/services/authService";
    import AppSidebar from "$lib/components/ui/AppSidebar.svelte";
    import {
        SidebarProvider,
        SidebarTrigger,
    } from "$lib/components/ui/sidebar";
    import { Separator } from "$lib/components/ui/separator";
    import type { UserProfile } from "$lib/types";

    let { children } = $props();

    let user = $state<UserProfile | null>(null);
    let isLoading = $state(true);

    onMount(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            goto("/auth");
            return;
        }
        const res = await authService.GetUserProfile();
        if (res.success && res.data) {
            user = res.data;
            isLoading = false;
        } else {
            localStorage.removeItem("token");
            goto("/auth");
        }
    });
</script>

{#if isLoading}
    <div class="flex h-screen w-full items-center justify-center bg-background">
        <span class="text-muted-foreground">Loading...</span>
    </div>
{:else}
    <SidebarProvider>
        <AppSidebar {user} />

        <main class="flex flex-1 flex-col overflow-hidden">
            <header class="flex h-16 shrink-0 items-center gap-2 border-b px-6">
                <div class="flex items-center gap-4">
                    <SidebarTrigger class="-ml-1 h-9 w-9 md:h-8 md:w-8" />
                    <Separator orientation="vertical" class="mr-2 h-4" />

                    <div class="flex items-center gap-2">
                        <Logo className="h-6 w-auto" />
                        <span class="text-sm font-semibold tracking-tight">
                            {user?.name}'s Todo
                        </span>
                    </div>
                </div>
            </header>

            <div class="flex flex-1 flex-col overflow-y-auto">
                {@render children()}
            </div>
        </main>
    </SidebarProvider>
{/if}
