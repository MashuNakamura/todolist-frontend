<script lang="ts">
    import { cn } from "$lib/utils";

    export let className: string | undefined | null = undefined;
</script>

<div class={cn("flex items-center gap-2", className)}>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        class="w-8 h-8 text-teal-600 dark:text-teal-400"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <path d="M7 5v22" />
        <path d="M24 6L7 18" />
        <path
            d="M13 19l4 4 10-10"
            stroke="currentColor"
            class="text-teal-700 dark:text-teal-300"
        />
    </svg>

    <span
        class="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
    >
        Koto<span class="text-teal-600 dark:text-teal-400">List</span>
    </span>
</div>
