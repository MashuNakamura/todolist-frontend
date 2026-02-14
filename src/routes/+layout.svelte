<script lang="ts">
	import "../app.css";
	import { ModeWatcher } from "mode-watcher";
	import { Toaster } from "$lib/components/ui/sonner";
	import { authService } from "$lib/services/authService";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import type { UserProfile } from "$lib/types";

	let { children } = $props();

	let user = $state<UserProfile>();
	let isAuthenticated = $state(false);
	let isChecking = $state(true);

	// Safe to use derived here
	let isDashboard = $derived($page.url.pathname.startsWith("/dashboard"));
	let isAuthPage = $derived($page.url.pathname.startsWith("/auth"));

	onMount(async () => {
		const token = localStorage.getItem("token");

		if (token) {
			const res = await authService.GetUserProfile();
			if (res.success) {
				user = res.data;
				isAuthenticated = true;

				// If logged in and on auth page, go to dashboard
				if ($page.url.pathname.startsWith("/auth")) {
					goto("/dashboard");
				}
			} else {
				// Invalid token
				handleLogout();
			}
		} else {
			// No token
			handleLogout();
		}

		isChecking = false;
	});

	function handleLogout() {
		localStorage.removeItem("token");
		isAuthenticated = false;
		user = undefined;
		// If on dashboard (protected), go to auth
		if ($page.url.pathname.startsWith("/dashboard")) {
			goto("/auth");
		}
	}

	// Reactive check for route changes after initial load
	$effect(() => {
		if (!isChecking) {
			if (isAuthenticated && $page.url.pathname.startsWith("/auth")) {
				goto("/dashboard");
			}
			if (
				!isAuthenticated &&
				$page.url.pathname.startsWith("/dashboard")
			) {
				goto("/auth");
			}
		}
	});
</script>

<ModeWatcher />
<Toaster />

{#if isChecking}
	<div class="flex h-screen w-full items-center justify-center bg-background">
		<!-- Simple Loading Spinner or Text -->
	</div>
{:else}
	{@render children()}
{/if}
