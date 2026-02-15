<script lang="ts">
    import { setMode, resetMode, mode } from "mode-watcher";
    import { toast } from "svelte-sonner";
    import { beforeNavigate, goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Moon, Sun, Monitor, Save, Loader2 } from "lucide-svelte";
    import { authService } from "@/services/authService";
    import type { UserProfile } from "@/types";
    import { userStore } from "$lib/stores/userStore.svelte";

    let profile = $state<UserProfile>({
        name: "",
        email: "",
    });

    let security = $state({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    let isSecurityLoading = $state(false);
    let isProfileLoading = $state(false);

    let originalName = $state(profile.name);
    let hasChanges = $derived(profile.name !== originalName);

    $effect(() => {
        authService.GetUserProfile().then((res) => {
            if (res.success && res.data) {
                profile.name = res.data.name;
                profile.email = res.data.email;
                originalName = res.data.name;
            } else {
                goto("/auth");
            }
        });
    });

    function handleChangePassword(e: Event) {
        e.preventDefault();

        if (security.new_password !== security.confirm_password) {
            toast.error("New password and confirmation do not match.");
            return;
        }
        if (!security.old_password || !security.new_password) {
            toast.error("Please fill in all password fields.");
            return;
        }

        isSecurityLoading = true;

        const payloadSecurity = {
            old_password: security.old_password,
            new_password: security.new_password,
        };

        authService
            .changePassword(payloadSecurity)
            .then((res) => {
                if (res.success) {
                    toast.success("Password changed successfully!", {
                        description: "Your password has been updated.",
                        action: {
                            label: "Close",
                            onClick: () => toast.dismiss(),
                        },
                    });
                    security.old_password = "";
                    security.new_password = "";
                    security.confirm_password = "";
                } else {
                    toast.error("Failed to change password", {
                        description: res.message,
                        action: {
                            label: "Close",
                            onClick: () => toast.dismiss(),
                        },
                    });
                }
            })
            .catch((err: any) => {
                toast.error("Failed to change password", {
                    description: err.message,
                    action: {
                        label: "Close",
                        onClick: () => toast.dismiss(),
                    },
                });
            })
            .finally(() => {
                isSecurityLoading = false;
            });
    }

    function saveSettings(e: Event) {
        e.preventDefault();

        if (!hasChanges) return;

        if (!hasChanges || isProfileLoading) return;

        isProfileLoading = true;

        authService
            .UpdateUserProfile(profile)
            .then((res) => {
                if (res.success) {
                    userStore.updateName(profile.name);
                    toast.success("Settings saved successfully!", {
                        description: "Your profile name has been updated.",
                        action: {
                            label: "Close",
                            onClick: () => toast.dismiss(),
                        },
                    });
                } else {
                    toast.error("Failed to save settings", {
                        description: res.message,
                        action: {
                            label: "Close",
                            onClick: () => toast.dismiss(),
                        },
                    });
                }
            })
            .catch((err: any) => {
                toast.error("Failed to save settings", {
                    description: err.message,
                    action: {
                        label: "Close",
                        onClick: () => toast.dismiss(),
                    },
                });
            })
            .finally(() => {
                isProfileLoading = false;
            });

        originalName = profile.name;
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

        // Ignore if the event target is inside the password form
        const target = e.target as HTMLElement;
        if (target.closest("form")) return;

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

<div class="w-full pb-8 px-2 md:px-6 bg-background min-h-screen pt-4">
    <div class="flex items-center justify-between gap-4 mb-8">
        <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
                Settings
            </h1>
            <p class="text-muted-foreground text-sm font-medium">
                Manage your profile and application preferences.
            </p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Main Column (Profile & Security) -->
        <div class="lg:col-span-8 flex flex-col gap-6">
            <Card class="shadow-sm">
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Update your account's profile information and email
                        address.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="grid gap-6">
                        <div class="grid gap-3">
                            <Label for="name">Display Name</Label>
                            <div class="flex items-center gap-2 max-w-lg">
                                <Input
                                    id="name"
                                    type="text"
                                    bind:value={profile.name}
                                    placeholder="Your Name"
                                    class="flex-1"
                                />
                                <Button
                                    onclick={saveSettings}
                                    size="sm"
                                    disabled={!hasChanges || isProfileLoading}
                                    class="shrink-0"
                                >
                                    {#if isProfileLoading}
                                        <Loader2
                                            class="mr-2 h-3 w-3 animate-spin"
                                        />
                                        Updating...
                                    {:else}
                                        <Save class="mr-2 h-3 w-3" /> Update
                                    {/if}
                                </Button>
                            </div>
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
                                disabled
                                class="max-w-lg bg-muted"
                            />
                            <p class="text-[0.8rem] text-muted-foreground">
                                Email address cannot be changed.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card class="shadow-sm">
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                        Manage your password and account security.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onsubmit={handleChangePassword}>
                        <div class="grid gap-4 max-w-lg">
                            <div class="grid gap-2">
                                <Label>Current Password</Label>
                                <Input
                                    type="password"
                                    bind:value={security.old_password}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div class="grid gap-2">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    bind:value={security.new_password}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div class="grid gap-2">
                                <Label>Confirm Password</Label>
                                <Input
                                    type="password"
                                    bind:value={security.confirm_password}
                                    placeholder="••••••••"
                                />
                            </div>
                            <Button
                                variant="outline"
                                type="submit"
                                class="w-full mt-2"
                                disabled={isSecurityLoading}
                            >
                                {#if isSecurityLoading}
                                    <Loader2
                                        class="mr-2 h-4 w-4 animate-spin"
                                    />
                                    Updating...
                                {:else}
                                    Update Password
                                {/if}
                            </Button>
                        </div>
                    </form></CardContent
                >
            </Card>
        </div>

        <!-- Sidebar Column (Appearance & Danger Zone) -->
        <div class="lg:col-span-4 flex flex-col gap-6">
            <Card class="shadow-sm">
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize the look and feel of your dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="grid grid-cols-3 gap-2">
                        <Button
                            variant="outline"
                            class={"h-20 flex flex-col items-center justify-center gap-2 border-2 hover:bg-muted/50 hover:text-foreground " +
                                (mode.current === "light"
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                    : "border-muted bg-transparent")}
                            onclick={() => setMode("light")}
                        >
                            <Sun
                                class="h-5 w-5 {mode.current === 'light'
                                    ? 'text-primary fill-current'
                                    : ''}"
                            />
                            <span class="text-xs font-medium">Light</span>
                        </Button>

                        <Button
                            variant="outline"
                            class={"h-20 flex flex-col items-center justify-center gap-2 border-2 hover:bg-muted/50 hover:text-foreground " +
                                (mode.current === "dark"
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                    : "border-muted bg-transparent")}
                            onclick={() => setMode("dark")}
                        >
                            <Moon
                                class="h-5 w-5 {mode.current === 'dark'
                                    ? 'text-primary fill-current'
                                    : ''}"
                            />
                            <span class="text-xs font-medium">Dark</span>
                        </Button>

                        <Button
                            variant="outline"
                            class={"h-20 flex flex-col items-center justify-center gap-2 border-2 hover:bg-muted/50 hover:text-foreground " +
                                (mode.current === null
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                    : "border-muted bg-transparent")}
                            onclick={() => resetMode()}
                        >
                            <Monitor
                                class="h-5 w-5 {mode.current === null
                                    ? 'text-primary'
                                    : ''}"
                            />
                            <span class="text-xs font-medium">System</span>
                        </Button>
                    </div>
                    <p class="text-[0.8rem] text-muted-foreground mt-4">
                        Select your preferred theme for the dashboard. System
                        theme adapts to your device settings.
                    </p>
                </CardContent>
            </Card>

            <Card class="border-destructive/20 bg-destructive/5 shadow-none">
                <CardHeader>
                    <CardTitle class="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Irreversible actions for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div class="flex flex-col gap-2">
                            <p class="text-sm font-medium text-destructive">
                                Sign Out
                            </p>
                            <p class="text-xs text-muted-foreground">
                                Log out from this device. You will need to sign
                                in again to access your dashboard.
                            </p>
                            <Button
                                variant="destructive"
                                size="sm"
                                class="w-full mt-2"
                                onclick={() => {
                                    authService.Logout();
                                    window.location.href = "/auth";
                                }}
                            >
                                Log out
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</div>
