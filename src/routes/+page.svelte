<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import {
        ArrowRight,
        Zap,
        Shield,
        Layout,
        Github,
        Linkedin,
        Code2,
        Terminal,
    } from "lucide-svelte";
    import { onMount } from "svelte";
    import { Badge } from "$lib/components/ui/badge";
    import * as Card from "$lib/components/ui/card";

    let isLoggedIn = $state(false);

    onMount(() => {
        if (localStorage.getItem("token")) {
            isLoggedIn = true;
        }
    });

    const features = [
        {
            icon: Zap,
            title: "Lightning Fast",
            desc: "Built with Go Fiber backend for millisecond latency.",
        },
        {
            icon: Layout,
            title: "Beautifully Organized",
            desc: "A clutter-free SvelteKit interface for maximum focus.",
        },
        {
            icon: Shield,
            title: "Secure Architecture",
            desc: "Standardized JWT Auth and secure data handling.",
        },
    ];

    const techStack = [
        "Golang",
        "SvelteKit",
        "TypeScript",
        "Shadcn UI",
        "PostgreSQL",
    ];
</script>

<div
    class="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20"
>
    <header
        class="px-6 h-20 flex items-center justify-between border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80"
    >
        <div class="flex items-center gap-3">
            <div
                class="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
            >
                <span class="text-xl font-bold text-primary-foreground">事</span
                >
            </div>
            <span class="text-2xl font-bold tracking-tight">Koto.</span>
        </div>

        <nav
            class="hidden md:flex gap-8 text-sm font-bold text-muted-foreground uppercase tracking-widest"
        >
            <a href="#features" class="hover:text-foreground transition-colors"
                >Features</a
            >
            <a href="#developer" class="hover:text-foreground transition-colors"
                >About</a
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

    <main class="flex-1">
        <section
            class="py-24 md:py-40 px-6 flex flex-col items-center text-center max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000"
        >
            <h1
                class="text-5xl md:text-7xl font-extrabold tracking-tight text-balance leading-tight"
            >
                Master your day with <br />
                <span
                    class="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                    >Unmatched Clarity.</span
                >
            </h1>

            <p
                class="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance leading-relaxed"
            >
                Koto combines the speed of Go with the elegance of SvelteKit.
                Experience a todo list that feels like a natural extension of
                your mind.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                    size="lg"
                    href={isLoggedIn ? "/dashboard" : "/auth"}
                    class="h-12 px-8 text-base font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                >
                    {isLoggedIn ? "Open Dashboard" : "Start for Free"}
                </Button>
                <Button
                    size="lg"
                    href="#developer"
                    variant="outline"
                    class="h-12 px-8 text-base font-bold"
                >
                    Meet the Maker
                </Button>
            </div>
        </section>

        <section
            id="features"
            class="py-24 bg-muted/30 border-y border-border/50"
        >
            <div class="container px-6 mx-auto">
                <div class="text-center mb-16 space-y-4">
                    <h2 class="text-3xl font-bold tracking-tight">Why Koto?</h2>
                    <p class="text-muted-foreground">
                        Minimalism meets performance.
                    </p>
                </div>
                <div class="grid md:grid-cols-3 gap-8">
                    {#each features as feature}
                        <Card.Root
                            class="bg-background border shadow-sm hover:shadow-md transition-all"
                        >
                            <Card.Header>
                                <div
                                    class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4"
                                >
                                    <feature.icon class="h-6 w-6" />
                                </div>
                                <Card.Title>{feature.title}</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <p
                                    class="text-muted-foreground leading-relaxed"
                                >
                                    {feature.desc}
                                </p>
                            </Card.Content>
                        </Card.Root>
                    {/each}
                </div>
            </div>
        </section>

        <section id="developer" class="py-24 px-6">
            <div class="container mx-auto max-w-4xl">
                <div
                    class="rounded-3xl border bg-card p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-12"
                >
                    <div class="shrink-0 relative group">
                        <div
                            class="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all"
                        ></div>
                        <img
                            src="https://avatars.githubusercontent.com/u/145318409?v=4"
                            alt="Federico Matthew"
                            class="h-40 w-40 rounded-full border-4 border-background shadow-2xl object-cover"
                        />
                    </div>

                    <div class="text-center md:text-left space-y-6">
                        <div>
                            <h2 class="text-3xl font-bold tracking-tight">
                                Built by Federico Matthew
                            </h2>
                            <p
                                class="text-primary font-bold mt-1 flex items-center justify-center md:justify-start gap-2"
                            >
                                <Code2 class="h-4 w-4" /> Full Stack Developer
                            </p>
                        </div>

                        <p
                            class="text-muted-foreground text-lg leading-relaxed"
                        >
                            Hi! I'm an Informatics student at UKDC passionate
                            about building high-performance web applications.
                            <b>Koto</b> was created to push the limits of the
                            <b>Go Fiber</b>
                            and <b>SvelteKit</b> stack—delivering a tool that is
                            as robust as it is simple.
                        </p>

                        <div
                            class="flex flex-wrap justify-center md:justify-start gap-2"
                        >
                            {#each techStack as tech}
                                <Badge variant="secondary" class="px-3 py-1"
                                    >{tech}</Badge
                                >
                            {/each}
                        </div>

                        <div
                            class="flex justify-center md:justify-start gap-4 pt-2"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                href="https://github.com/MashuNakamura/todolist-frontend"
                                target="_blank"
                                class="gap-2"
                            >
                                <Github class="h-4 w-4" /> GitHub
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                href="https://www.linkedin.com/in/federico-matthew-pratama-6a388b2a9/"
                                target="_blank"
                                class="gap-2"
                            >
                                <Linkedin class="h-4 w-4" /> LinkedIn
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
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
                <a href="/terms" class="hover:text-foreground">Terms</a>
                <a
                    href="mailto:federicomatthewpratamaa@gmail.com"
                    class="hover:text-foreground">Contact</a
                >
            </div>
        </div>
    </footer>
</div>

<style>
    .perspective-1000 {
        perspective: 1000px;
    }
    .rotate-x-12 {
        transform: rotateX(12deg);
    }
</style>
