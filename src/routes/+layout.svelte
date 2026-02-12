<script lang="ts">
	import "../app.css";
	import { ModeWatcher } from "mode-watcher";
	import { Toaster } from "$lib/components/ui/sonner";
	import {
		SidebarProvider,
		SidebarTrigger,
	} from "$lib/components/ui/sidebar";
	import { Separator } from "$lib/components/ui/separator";
	import AppSidebar from "$lib/components/ui/AppSidebar.svelte";

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />

<SidebarProvider>
	<AppSidebar />

	<main class="flex flex-1 flex-col overflow-hidden">
		<header
			class="flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
		>
			<div class="flex items-center gap-2">
				<SidebarTrigger class="-ml-1 h-9 w-9 md:h-8 md:w-8" />

				<Separator orientation="vertical" class="mr-2 h-4" />

				<span class="text-sm font-medium text-muted-foreground"
					>Mashu Todo</span
				>
			</div>
		</header>

		<div class="flex flex-1 flex-col gap-4 p-6 overflow-y-auto">
			{@render children()}
		</div>
	</main>
</SidebarProvider>
