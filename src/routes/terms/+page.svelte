<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { ArrowRight, ArrowLeft } from "lucide-svelte";
    import { onMount } from "svelte";

    let isLoggedIn = $state(false);

    onMount(() => {
        if (localStorage.getItem("token")) {
            isLoggedIn = true;
        }
    });
</script>

<div
    class="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20"
>
    <header
        class="px-6 h-20 flex items-center justify-between border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80"
    >
        <div class="flex items-center gap-3">
            <a
                href="/"
                class="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
                <div
                    class="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
                >
                    <span class="text-xl font-bold text-primary-foreground"
                        >事</span
                    >
                </div>
                <span class="text-2xl font-bold tracking-tight">Koto.</span>
            </a>
        </div>

        <nav
            class="hidden md:flex gap-8 text-sm font-bold text-muted-foreground uppercase tracking-widest"
        >
            <a href="/#features" class="hover:text-foreground transition-colors"
                >Features</a
            >
            <a
                href="/#developer"
                class="hover:text-foreground transition-colors">About</a
            >
        </nav>

        <div class="flex items-center gap-4">
            {#if isLoggedIn}
                <Button
                    href="/dashboard"
                    class="font-bold shadow-lg shadow-primary/25"
                >
                    Dashboard <ArrowRight class="ml-2 h-4 w-4" />
                </Button>
            {:else}
                <Button
                    href="/auth"
                    variant="ghost"
                    class="font-bold hover:bg-muted">Log in</Button
                >
                <Button
                    href="/auth?mode=register"
                    variant="default"
                    class="font-bold shadow-md">Get Started</Button
                >
            {/if}
        </div>
    </header>

    <main class="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <div class="mb-8">
            <Button
                href="/"
                variant="ghost"
                size="sm"
                class="pl-0 hover:pl-2 transition-all gap-2 text-muted-foreground"
            >
                <ArrowLeft class="h-4 w-4" /> Back to Home
            </Button>
        </div>

        <div
            class="bg-yellow-500/10 border-b border-yellow-500/20 p-2 text-center text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-8 rounded-lg"
        >
            🚧 DISCLAIMER: Koto is a personal portfolio project. Do not store
            sensitive data. 🚧
        </div>

        <div class="prose prose-slate dark:prose-invert max-w-none">
            <h1 class="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                Terms of Service
            </h1>
            <p class="text-xl text-muted-foreground mb-8">
                Last updated: February 14, 2026
            </p>

            <div class="space-y-8">
                <section class="p-6 rounded-2xl border bg-card shadow-sm">
                    <h2 class="text-2xl font-bold mb-4">
                        1. Acceptance of Terms
                    </h2>
                    <p class="text-muted-foreground leading-relaxed">
                        By accessing or using Koto, you agree to be bound by
                        these Terms of Service. Koto is a portfolio project
                        provided "as is" for demonstration purposes. If you do
                        not agree to these terms, please do not use our service.
                    </p>
                </section>

                <section class="p-6 rounded-2xl border bg-card shadow-sm">
                    <h2 class="text-2xl font-bold mb-4">2. Use License</h2>
                    <p class="text-muted-foreground leading-relaxed">
                        Permission is granted to temporarily use Koto for
                        personal, non-commercial transitory viewing and testing.
                        This is the grant of a license, not a transfer of title.
                        The source code is available on <a
                            href="https://github.com/MashuNakamura/todolist-frontend"
                            target="_blank"
                            class="text-primary font-bold hover:underline"
                            >GitHub</a
                        > under the MIT License.
                    </p>
                </section>

                <section class="p-6 rounded-2xl border bg-card shadow-sm">
                    <h2 class="text-2xl font-bold mb-4">3. Disclaimer</h2>
                    <p class="text-muted-foreground leading-relaxed">
                        The materials on Koto's website are provided on an 'as
                        is' basis. This service is provided for educational and
                        portfolio demonstration purposes only. It is not
                        intended for mission-critical use.
                    </p>
                </section>

                <section class="p-6 rounded-2xl border bg-card shadow-sm">
                    <h2 class="text-2xl font-bold mb-4">4. Limitations</h2>
                    <p class="text-muted-foreground leading-relaxed">
                        As a free portfolio project, we are not responsible for
                        any data loss. Please use this application for testing
                        and demonstration purposes only.
                    </p>
                </section>

                <section class="p-6 rounded-2xl border bg-card shadow-sm">
                    <h2 class="text-2xl font-bold mb-4">5. Governing Law</h2>
                    <p class="text-muted-foreground leading-relaxed">
                        These terms are governed by the laws of Indonesia.
                    </p>
                </section>
            </div>
        </div>
    </main>

    <footer class="py-12 px-6 border-t bg-muted/10">
        <div
            class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"
        >
            <div class="flex items-center gap-2 opacity-50">
                <span class="font-bold text-sm"
                    >Federico Matthew &copy; 2026</span
                >
            </div>
            <div
                class="flex gap-6 text-xs font-bold text-muted-foreground uppercase tracking-widest"
            >
                <a href="/privacy" class="hover:text-foreground">Privacy</a>
                <a href="/terms" class="text-foreground">Terms</a>
                <a
                    href="mailto:federicomatthewpratamaa@gmail.com"
                    class="hover:text-foreground">Contact</a
                >
            </div>
        </div>
    </footer>
</div>
