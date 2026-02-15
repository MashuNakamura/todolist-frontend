<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    onMount(() => {
        const token = $page.url.searchParams.get("token");

        if (token) {
            localStorage.setItem("token", token);
            window.location.href = "/dashboard";
        } else {
            goto("/auth");
        }
    });
</script>

<div
    class="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background"
>
    <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"
    ></div>
    <p class="text-lg font-medium text-muted-foreground">Loggin in...</p>
</div>
