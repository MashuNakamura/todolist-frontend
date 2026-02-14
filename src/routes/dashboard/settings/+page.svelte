<script lang="ts">
    import { setMode, resetMode, mode } from "mode-watcher";
    import { toast } from "svelte-sonner";
    import { beforeNavigate } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Separator } from "$lib/components/ui/separator";
    import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
        CardFooter,
    } from "$lib/components/ui/card";
    import { Moon, Sun, Monitor, Save } from "lucide-svelte";

    let profile = $state({
        name: "Mashu Nakamura",
        email: "[EMAIL_ADDRESS]",
    });

    let originalName = $state(profile.name);
    let hasChanges = $derived(profile.name !== originalName);

    function saveSettings(e: Event) {
        e.preventDefault();

        if (!hasChanges) return;

        // Simulating API call
        originalName = profile.name;

        toast.success("Settings saved successfully!", {
            description: "Your profile name has been updated.",
            action: {
                label: "Close",
                onClick: () => toast.dismiss(),
            },
        });
    }

    beforeNavigate(({ cancel }) => {
        if (hasChanges) {
            if (
                !window.confirm(
                    "You have unsaved changes to your profile name. Are you sure you want to leave?",
                )
            ) {
                cancel();
            }
        }
    });
    function handleKeydown(e: KeyboardEvent) {
        if (!hasChanges) return;

        if (e.key === "Enter") {
            e.preventDefault();
            saveSettings(e);
        } else if (e.key === "Escape") {
            e.preventDefault();
            profile.name = originalName;
            toast.info("Changes discarded.", {
                description: "Profile name reset to original.",
            });
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="w-full pb-32 px-4 md:px-8 bg-background min-h-screen pt-6">
    <div
        class="flex items-center justify-between gap-4 mb-8 max-w-2xl mx-auto md:mx-0"
    >
        <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
                Settings
            </h1>
            <p class="text-muted-foreground text-sm font-medium">
                Manage your profile and application preferences.
            </p>
        </div>
    </div>

    <Card class="w-full max-w-2xl mx-auto md:mx-0 shadow-sm">
        <CardHeader>
            <CardTitle>Generals</CardTitle>
            <CardDescription
                >Customize your profile information and appearance.</CardDescription
            >
        </CardHeader>

        <CardContent class="space-y-8">
            <div class="space-y-4">
                <h3
                    class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                >
                    Profile
                </h3>

                <div class="grid gap-3">
                    <Label for="name">Display Name</Label>
                    <Input
                        id="name"
                        type="text"
                        bind:value={profile.name}
                        placeholder="Your Name"
                        class="max-w-md"
                    />
                    <p class="text-[0.8rem] text-muted-foreground">
                        This is the name that will be displayed on your
                        dashboard.
                    </p>
                </div>

                <div class="grid gap-3">
                    <Label for="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        readonly
                        class="bg-muted/50 max-w-md"
                    />
                    <p class="text-[0.8rem] text-muted-foreground">
                        Your email address is managed by your provider.
                    </p>
                </div>
            </div>

            <Separator />

            <div class="space-y-4">
                <h3
                    class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                >
                    Appearance
                </h3>
                <p class="text-sm text-muted-foreground">
                    Select the theme for the dashboard.
                </p>

                <div class="grid grid-cols-3 gap-4 max-w-md">
                    <Button
                        variant="outline"
                        class={"h-24 flex flex-col items-center justify-center gap-2 border-2 hover:bg-muted/50 hover:text-foreground " +
                            (mode.current === "light"
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-muted bg-transparent")}
                        onclick={() => setMode("light")}
                    >
                        <Sun
                            class="h-6 w-6 {mode.current === 'light'
                                ? 'text-primary fill-current'
                                : ''}"
                        />
                        <span class="font-medium">Light</span>
                    </Button>

                    <Button
                        variant="outline"
                        class={"h-24 flex flex-col items-center justify-center gap-2 border-2 hover:bg-muted/50 hover:text-foreground " +
                            (mode.current === "dark"
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-muted bg-transparent")}
                        onclick={() => setMode("dark")}
                    >
                        <Moon
                            class="h-6 w-6 {mode.current === 'dark'
                                ? 'text-primary fill-current'
                                : ''}"
                        />
                        <span class="font-medium">Dark</span>
                    </Button>

                    <Button
                        variant="outline"
                        class={"h-24 flex flex-col items-center justify-center gap-2 border-2 hover:bg-muted/50 hover:text-foreground " +
                            (mode.current === null
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-muted bg-transparent")}
                        onclick={() => resetMode()}
                    >
                        <Monitor
                            class="h-6 w-6 {mode.current === null
                                ? 'text-primary'
                                : ''}"
                        />
                        <span class="font-medium">System</span>
                    </Button>
                </div>
            </div>
        </CardContent>

        <CardFooter class="flex justify-between py-6 border-t bg-muted/20">
            <div class="text-xs text-muted-foreground">
                Last saved: Just now
            </div>
            <Button
                onclick={saveSettings}
                class="shadow-md"
                disabled={!hasChanges}
            >
                <Save class="mr-2 h-4 w-4" /> Save Changes
            </Button>
        </CardFooter>
    </Card>
</div>
