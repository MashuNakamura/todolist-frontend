<script lang="ts">
    import { onMount } from "svelte";
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

    // Init null biar aman
    let user = $state<UserProfile | null>(null);
    let isLoading = $state(true);

    onMount(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            // Gak ada token? Langsung tendang keluar
            goto("/auth");
            return;
        }

        // Ada token? Validasi ke server
        const res = await authService.GetUserProfile();
        if (res.success && res.data) {
            user = res.data;
            isLoading = false; // Data siap, tampilkan dashboard
        } else {
            // Token expired/invalid
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
        <AppSidebar />

        <main class="flex flex-1 flex-col overflow-hidden">
            <header class="flex h-16 shrink-0 items-center gap-2 border-b px-6">
                <div class="flex items-center gap-2">
                    <SidebarTrigger class="-ml-1 h-9 w-9 md:h-8 md:w-8" />
                    <Separator orientation="vertical" class="mr-2 h-4" />
                    <span class="text-sm font-medium text-muted-foreground">
                        {user?.name}'s Todo
                    </span>
                </div>
            </header>

            <div class="flex flex-1 flex-col gap-4 p-6 overflow-y-auto">
                {@render children()}
            </div>
        </main>
    </SidebarProvider>
{/if}
