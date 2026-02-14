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
                Privacy Policy
            </h1>
            <p class="text-xl text-muted-foreground mb-8">
                Last updated: February 14, 2026
            </p>

            <div class="space-y-8">
                <section class="p-6 rounded-2xl border bg-card shadow-sm">
                    <h2 class="text-2xl font-bold mb-4">1. Introduction</h2>
                    <p class="text-muted-foreground leading-relaxed">
                        Koto is a personal portfolio project created to
                        demonstrate technical skills. While we treat your data
                        securely using industry standards (hashing, encryption),
                        please be aware that this is a demonstration
                        environment.
                    </p>
                </section>

                <section class="p-6 rounded-2xl border bg-card shadow-sm">
                    <h2 class="text-2xl font-bold mb-4">2. Data We Collect</h2>
                    <ul class="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>
                            <strong>Account Information:</strong> When you register,
                            we collect your username and password (which is hashed
                            and securely stored).
                        </li>
                        <li>
                            <strong>Task Data:</strong> We store the tasks, descriptions,
                            and statuses you create within the application.
                        </li>
                        <li>
                            <strong>Usage Data:</strong> We may collect anonymous
                            metrics to improve system performance (latency, error
                            rates).
                        </li>
                    </ul>
                </section>

                <section class="p-6 rounded-2xl border bg-card shadow-sm">
                    <h2 class="text-2xl font-bold mb-4">3. Data Retention</h2>
                    <p class="text-muted-foreground leading-relaxed">
                        We reserve the right to reset the database periodically
                        as part of maintenance. Your data may be deleted without
                        notice during these maintenance periods.
                    </p>
                </section>

                <section class="p-6 rounded-2xl border bg-card shadow-sm">
                    <h2 class="text-2xl font-bold mb-4">
                        4. How We Use Your Data
                    </h2>
                    <p class="text-muted-foreground leading-relaxed">
                        Your data is used solely to provide the core
                        functionality of the Koto application:
                    </p>
                    <ul
                        class="list-disc pl-6 mt-4 space-y-2 text-muted-foreground"
                    >
                        <li>To authenticate you and secure your session.</li>
                        <li>To persist your todo list items across devices.</li>
                        <li>
                            To demonstrate the features of this portfolio
                            project.
                        </li>
                    </ul>
                </section>

                <section class="p-6 rounded-2xl border bg-card shadow-sm">
                    <h2 class="text-2xl font-bold mb-4">5. Data Security</h2>
                    <p class="text-muted-foreground leading-relaxed">
                        We implement strict security measures, including <strong
                            >JWT-based authentication</strong
                        >
                        and <strong>password hashing (Argon2/Bcrypt)</strong>.
                        While we strive to use commercially acceptable means to
                        protect your Personal Data, remember that no method of
                        transmission over the Internet is 100% secure.
                    </p>
                </section>

                <section class="p-6 rounded-2xl border bg-card shadow-sm">
                    <h2 class="text-2xl font-bold mb-4">6. Contact Us</h2>
                    <p class="text-muted-foreground leading-relaxed">
                        If you have any questions about this Privacy Policy,
                        please contact the developer at:
                        <a
                            href="mailto:federicomatthewpratamaa@gmail.com"
                            class="text-primary font-bold hover:underline ml-1"
                            >federicomatthewpratamaa@gmail.com</a
                        >
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
                <a href="/privacy" class="text-foreground">Privacy</a>
                <a href="/terms" class="hover:text-foreground">Terms</a>
                <a
                    href="mailto:federicomatthewpratamaa@gmail.com"
                    class="hover:text-foreground">Contact</a
                >
            </div>
        </div>
    </footer>
</div>
