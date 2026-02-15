<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { toast } from "svelte-sonner";
    import { authService } from "$lib/services/authService";
    import { Loader2, ArrowLeft, Home } from "lucide-svelte";

    let view = $state("login");
    let isLoading = $state(false);

    let name = $state("");
    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");
    let otp = $state("");

    async function handleLogin(e: Event) {
        e.preventDefault();
        isLoading = true;
        try {
            if (!email || !password) {
                toast.error("Please fill in all fields");
                return;
            }

            if (!email.includes("@")) {
                toast.error("Please enter a valid email");
                return;
            }

            const res = await authService.login({ email, password });
            if (res.success && res.data) {
                localStorage.setItem("token", res.data.token);
                toast.success("Login successful!");
                window.location.href = "/dashboard";
            } else {
                let res_error = Number(res.error);
                if (res_error >= 400 && res_error < 500) {
                    toast.warning(res.message);
                } else {
                    toast.error(res.message || "Server Error");
                }
            }
        } catch (err) {
            toast.error("Network connection error");
        } finally {
            isLoading = false;
        }
    }

    async function handleRegister(e: Event) {
        e.preventDefault();
        isLoading = true;
        try {
            if (!name || !email || !password || !confirmPassword) {
                toast.error("Please fill in all fields");
                return;
            }

            if (!email.includes("@")) {
                toast.error("Please enter a valid email");
                return;
            }

            if (password !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }

            const res = await authService.register({ name, email, password });
            if (res.success) {
                toast.success("Registration successful! Please login.");
                view = "login";
            } else {
                toast.error(res.message || "Registration failed");
            }
        } catch (err) {
            toast.error("Network connection error");
        } finally {
            isLoading = false;
        }
    }

    async function handleGoogleLogin() {
        isLoading = true;
        try {
            const res = await authService.googleLogin();
            if (res.url) {
                window.location.href = res.url;
            } else {
                toast.error("Failed to initialize Google Login");
            }
        } catch (err) {
            console.error(err);
            toast.error("Network connection error");
        } finally {
            isLoading = false;
        }
    }

    async function handleForgotPassword(e: Event) {
        e.preventDefault();
        isLoading = true;
        try {
            const res = await authService.forgotPassword({ email });
            if (res.success) {
                toast.success("OTP sent to your email!");
                view = "reset";
            } else {
                toast.error(res.message || "Failed to send OTP");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            isLoading = false;
        }
    }

    async function handleResetPassword(e: Event) {
        e.preventDefault();
        isLoading = true;
        try {
            const res = await authService.resetPassword({
                email,
                otp,
                password,
            });
            if (res.success) {
                toast.success("Password reset successful! Please login.");
                view = "login";
            } else {
                toast.error(res.message || "Reset failed");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            isLoading = false;
        }
    }
</script>

<div
    class="min-h-screen flex items-center justify-center bg-muted/40 p-4 relative"
>
    <a
        href="/"
        class="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
    >
        <div
            class="h-8 w-8 bg-background border rounded-lg flex items-center justify-center shadow-sm"
        >
            <Home class="h-4 w-4" />
        </div>
        <span class="hidden sm:inline">Back to Home</span>
    </a>
    <Card.Root
        class="w-full max-w-md shadow-xl border-none sm:border bg-background"
    >
        <Card.Header class="space-y-1 text-center">
            <Card.Title class="text-2xl font-bold tracking-tight">
                {#if view === "login"}
                    Welcome Back
                {:else if view === "register"}
                    Create Account
                {:else if view === "forgot"}
                    Forgot Password
                {:else if view === "reset"}
                    Reset Password
                {/if}
            </Card.Title>
            <Card.Description>
                {#if view === "login"}
                    Enter your credentials to access your tasks.
                {:else if view === "register"}
                    Join us and start managing your day.
                {:else if view === "forgot"}
                    Enter your email to receive a reset code.
                {:else if view === "reset"}
                    Check your email for the OTP code.
                {/if}
            </Card.Description>
        </Card.Header>

        <Card.Content>
            {#if view === "login"}
                <form onsubmit={handleLogin} class="space-y-4">
                    <div class="space-y-2">
                        <Label for="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            bind:value={email}
                            required
                        />
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <Label for="password">Password</Label>
                            <button
                                type="button"
                                onclick={() => (view = "forgot")}
                                class="text-xs text-primary hover:underline font-medium"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            bind:value={password}
                            required
                        />
                    </div>
                    <Button type="submit" class="w-full" disabled={isLoading}>
                        {#if isLoading}
                            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        {/if}
                        Sign In
                    </Button>
                </form>

                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t"></span>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span
                            class="bg-background p-4 px-2 text-muted-foreground"
                        >
                            Or continue with
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    type="button"
                    class="w-full"
                    disabled={isLoading}
                    onclick={handleGoogleLogin}
                >
                    {#if isLoading}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                    {:else}
                        <svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    {/if}
                    Google
                </Button>

                <div class="mt-4 text-center text-sm">
                    Don't have an account?
                    <button
                        onclick={() => (view = "register")}
                        class="underline text-primary font-bold">Sign up</button
                    >
                </div>
            {/if}

            {#if view === "register"}
                <form onsubmit={handleRegister} class="space-y-4">
                    <div class="space-y-2">
                        <Label for="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            bind:value={name}
                            required
                        />
                    </div>
                    <div class="space-y-2">
                        <Label for="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            bind:value={email}
                            required
                        />
                    </div>
                    <div class="space-y-2">
                        <Label for="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            bind:value={password}
                            required
                        />
                    </div>
                    <div class="space-y-2">
                        <Label for="confirm-password">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            bind:value={confirmPassword}
                            required
                        />
                    </div>
                    <Button type="submit" class="w-full" disabled={isLoading}>
                        {#if isLoading}
                            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        {/if}
                        Create Account
                    </Button>
                </form>

                <div class="mt-4 text-center text-sm">
                    Already have an account?
                    <button
                        onclick={() => (view = "login")}
                        class="underline text-primary font-bold">Sign in</button
                    >
                </div>
            {/if}

            {#if view === "forgot"}
                <form onsubmit={handleForgotPassword} class="space-y-4">
                    <div class="space-y-2">
                        <Label for="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            bind:value={email}
                            required
                        />
                    </div>
                    <Button type="submit" class="w-full" disabled={isLoading}>
                        {#if isLoading}
                            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        {/if}
                        Send Reset Code
                    </Button>
                </form>
                <div class="mt-4 text-center">
                    <button
                        onclick={() => (view = "login")}
                        class="text-sm flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft class="h-4 w-4" /> Back to Login
                    </button>
                </div>
            {/if}

            {#if view === "reset"}
                <form onsubmit={handleResetPassword} class="space-y-4">
                    <div
                        class="p-3 bg-muted/30 rounded-lg text-sm text-center text-muted-foreground"
                    >
                        Code sent to <span class="font-bold text-foreground"
                            >{email}</span
                        >
                    </div>
                    <div class="space-y-2">
                        <Label for="otp">OTP Code</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="123456"
                            bind:value={otp}
                            class="text-center tracking-widest font-mono text-lg"
                            required
                        />
                    </div>
                    <div class="space-y-2">
                        <Label for="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="Enter new password"
                            bind:value={password}
                            required
                        />
                    </div>
                    <Button type="submit" class="w-full" disabled={isLoading}>
                        {#if isLoading}
                            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        {/if}
                        Reset Password
                    </Button>
                </form>
                <div class="mt-4 text-center">
                    <button
                        onclick={() => (view = "forgot")}
                        class="text-sm text-muted-foreground hover:text-foreground underline"
                    >
                        Resend Code
                    </button>
                    <button
                        onclick={() => (view = "login")}
                        class="text-sm flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground mx-auto pt-2"
                    >
                        <ArrowLeft class="h-4 w-4" /> Back to Login
                    </button>
                </div>
            {/if}
        </Card.Content>
    </Card.Root>
</div>
