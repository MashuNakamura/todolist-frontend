<script lang="ts">
    import { setMode, resetMode, mode } from "mode-watcher";
    import { toast } from "svelte-sonner";
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

    function saveSettings(e: Event) {
        e.preventDefault();
        toast.success("Settings saved successfully!", {
            description: "Profile updated and theme applied.",
            action: {
                label: "Close",
                onClick: () => toast.dismiss(),
            },
        });
    }
</script>

<div class="flex items-center justify-center min-h-[80vh] px-4">
    <Card class="w-full max-w-lg">
        <CardHeader>
            <CardTitle class="text-2xl">Profile Settings</CardTitle>
            <CardDescription
                >Manage your profile and application settings here.</CardDescription
            >
        </CardHeader>

        <CardContent class="space-y-6">
            <div class="space-y-4">
                <h3 class="text-lg font-medium">Profile</h3>

                <div class="grid gap-2">
                    <Label for="name">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        bind:value={profile.name}
                        placeholder="Full Name"
                    />
                    <p class="text-[0.8rem] text-muted-foreground">
                        This name will appear on your dashboard.
                    </p>
                </div>

                <div class="grid gap-2">
                    <Label for="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        readonly
                        class="bg-muted opacity-80 cursor-not-allowed"
                    />
                    <p class="text-[0.8rem] text-muted-foreground">
                        Email cannot be changed.
                    </p>
                </div>
            </div>

            <Separator />

            <div class="space-y-4">
                <h3 class="text-lg font-medium">Appearance</h3>
                <div class="grid grid-cols-3 gap-2">
                    <Button
                        variant="outline"
                        class={mode.current === "light"
                            ? "border-primary border-2 bg-primary/5"
                            : ""}
                        onclick={() => setMode("light")}
                    >
                        <Sun class="mr-2 h-4 w-4" /> Light
                    </Button>

                    <Button
                        variant="outline"
                        class={mode.current === "dark"
                            ? "border-primary border-2 bg-primary/5"
                            : ""}
                        onclick={() => setMode("dark")}
                    >
                        <Moon class="mr-2 h-4 w-4" /> Dark
                    </Button>

                    <Button
                        variant="outline"
                        class={mode.current === null
                            ? "border-primary border-2 bg-primary/5"
                            : ""}
                        onclick={() => resetMode()}
                    >
                        <Monitor class="mr-2 h-4 w-4" /> System
                    </Button>
                </div>
            </div>
        </CardContent>

        <Separator />

        <CardFooter class="flex justify-end py-4">
            <Button>
                <Save class="mr-2 h-4 w-4" /> Save Changes
            </Button>
        </CardFooter>
    </Card>
</div>
