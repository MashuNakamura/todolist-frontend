<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { categoryService, taskService } from "$lib";
    import { userStore } from "$lib/stores/userStore.svelte";
    import type { Category } from "$lib";
    import {
        Plus,
        MoreVertical,
        Edit,
        Trash2,
        Search,
        Tag,
        Check,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";

    // --- 1. STATE ---
    // State Form
    const formData = $state({
        name: "",
        color: "",
    });

    // Color Options
    const colorOptions = [
        "bg-red-500",
        "bg-orange-500",
        "bg-amber-500",
        "bg-yellow-500",
        "bg-lime-500",
        "bg-green-500",
        "bg-emerald-500",
        "bg-teal-500",
        "bg-cyan-500",
        "bg-sky-500",
        "bg-blue-500",
        "bg-indigo-500",
        "bg-violet-500",
        "bg-purple-500",
        "bg-fuchsia-500",
        "bg-pink-500",
        "bg-rose-500",
    ];

    let searchQuery = $state("");
    let isDialogOpen = $state(false);
    let isEditMode = $state(false);
    let editingId = $state<number | null>(null);
    let isLoading = $state(false);

    let categories = $state<Category[]>([]);

    // --- 2. FETCH DATA ---
    $effect(() => {
        const userId = userStore.profile.ID;
        if (!userId) return;

        Promise.all([
            categoryService.getCategories(),
            taskService.getTasks(),
        ]).then(([catRes, taskRes]) => {
            if (catRes.success && taskRes.success) {
                const allCats = catRes.data || [];
                const allTasks = taskRes.data || [];

                categories = allCats.map((cat: any) => {
                    const taskCount = allTasks.filter(
                        (t: any) => t.tags && t.tags.includes(cat.name),
                    ).length;

                    return {
                        ID: cat.ID,
                        name: cat.name,
                        color: cat.color,
                        count: taskCount,
                    };
                });
            } else {
                console.error("Failed to load data");
            }
        });
    });

    // --- 3. LOGIC ---
    const filteredCategories = $derived(
        categories.filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );

    // --- 4. HANDLERS ---
    function openAddDialog() {
        isEditMode = false;
        formData.name = "";
        formData.color = "bg-blue-500";
        isDialogOpen = true;
    }

    function openEditDialog(cat: any) {
        isEditMode = true;
        editingId = cat.ID;
        formData.name = cat.name;
        formData.color = cat.color;
        isDialogOpen = true;
    }

    async function handleDelete(id: number) {
        // Optimistic UI
        const originalCategories = [...categories];
        categories = categories.filter((c) => c.ID !== id);

        const res = await categoryService.deleteCategory(id);

        if (res.success) {
            toast.success("Category deleted");
        } else {
            categories = originalCategories;
            toast.error(res.message || "Failed to delete category");
        }
    }

    async function handleSave(e: Event) {
        e.preventDefault();
        isLoading = true;

        if (isEditMode && editingId) {
            const originalCat = categories.find((c) => c.ID === editingId);

            if (
                originalCat &&
                originalCat.name === formData.name &&
                originalCat.color === formData.color
            ) {
                toast.info("No changes detected");
                isLoading = false;
                isDialogOpen = false;
                return;
            }

            // --- UPDATE LOGIC ---
            const payload = {
                ID: editingId,
                name: formData.name,
                color: formData.color,
            };

            const res = await categoryService.updateCategory(
                editingId,
                payload,
            );

            if (res.success) {
                toast.success("Category updated successfully");
                // Update Local State
                const index = categories.findIndex((c) => c.ID === editingId);
                if (index !== -1) {
                    categories[index] = {
                        ...categories[index],
                        name: formData.name,
                        color: formData.color,
                    };
                }
                isDialogOpen = false;
            } else {
                toast.error(res.message || "Failed to update category");
            }
        } else {
            // --- CREATE LOGIC ---
            const payload = {
                name: formData.name,
                color: formData.color,
            };

            const res = await categoryService.createCategory(payload);

            if (res.success && res.data) {
                toast.success("New category created");
                // Push ke Local State
                categories = [
                    ...categories,
                    {
                        ID: res.data.ID,
                        name: res.data.name,
                        color: res.data.color,
                        count: 0,
                    },
                ];
                isDialogOpen = false;
            } else {
                toast.error(res.message || "Failed to create category");
            }
        }

        isLoading = false;
    }
</script>

<div class="w-full pb-2 px-2 md:px-6 bg-background min-h-screen">
    <div class="flex items-center justify-between gap-4 mb-8">
        <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
                Categories
            </h1>
            <p class="text-muted-foreground text-[10px] md:text-sm font-medium">
                Organize your tasks with color-coded labels.
            </p>
        </div>
        <Button size="sm" onclick={openAddDialog}>
            <Plus class="mr-1 h-4 w-4" />
            <span class="hidden md:inline">New Category</span><span
                class="md:hidden text-xs">New</span
            >
        </Button>
    </div>

    <div class="relative mb-6">
        <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
            placeholder="Search categories..."
            class="pl-9 bg-card max-w-sm"
            bind:value={searchQuery}
        />
    </div>

    <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
        {#each filteredCategories as cat (cat.ID)}
            <Card.Root
                class="group hover:border-primary/50 transition-colors bg-card"
            >
                <Card.Header
                    class="flex flex-row items-start justify-between space-y-0 pb-2"
                >
                    <div class="flex items-center gap-2">
                        <div
                            class="h-3 w-3 rounded-full {cat.color} ring-2 ring-background shadow-sm"
                        ></div>
                        <Card.Title class="text-sm font-bold leading-none"
                            >{cat.name}</Card.Title
                        >
                    </div>

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                class="h-8 w-8 -mr-2"
                                ><MoreVertical class="h-4 w-4" /></Button
                            >
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end">
                            <DropdownMenu.Item
                                onclick={() => openEditDialog(cat)}
                                ><Edit class="mr-2 h-4 w-4" /> Edit</DropdownMenu.Item
                            >
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item
                                class="text-destructive"
                                onclick={() => handleDelete(cat.ID)}
                                ><Trash2 class="mr-2 h-4 w-4" /> Delete</DropdownMenu.Item
                            >
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </Card.Header>

                <Card.Content>
                    <div class="text-2xl font-bold">{cat.count}</div>
                    <p class="text-xs text-muted-foreground font-medium mt-1">
                        Active Tasks
                    </p>
                </Card.Content>
            </Card.Root>
        {:else}
            <div
                class="col-span-full flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10"
            >
                <Tag class="h-8 w-8 mb-2 opacity-50" />
                <p class="text-sm font-medium">No categories found</p>
            </div>
        {/each}

        <button
            onclick={openAddDialog}
            class="flex flex-col items-center justify-center h-full min-h-[140px] border-2 border-dashed rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-all group cursor-pointer text-muted-foreground hover:text-primary"
        >
            <div
                class="h-10 w-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors"
            >
                <Plus class="h-6 w-6" />
            </div>
            <span class="text-sm font-bold">Create New</span>
        </button>
    </div>
</div>

<Dialog.Root bind:open={isDialogOpen}>
    <Dialog.Content class="sm:max-w-[425px] bg-background">
        <form onsubmit={handleSave}>
            <Dialog.Header>
                <Dialog.Title
                    >{isEditMode
                        ? "Edit Category"
                        : "New Category"}</Dialog.Title
                >
                <Dialog.Description
                    >Create a new label to organize your tasks.</Dialog.Description
                >
            </Dialog.Header>

            <div class="grid gap-6 py-4">
                <div class="grid gap-2">
                    <Label for="name">Name</Label>
                    <Input
                        id="name"
                        bind:value={formData.name}
                        placeholder="e.g. Work, Personal"
                        required
                        class="font-bold"
                    />
                </div>

                <div class="grid gap-3">
                    <Label>Color Tag</Label>
                    <div class="grid grid-cols-6 gap-2">
                        {#each colorOptions as color}
                            <button
                                type="button"
                                onclick={() => (formData.color = color)}
                                class="h-8 w-8 rounded-full {color} flex items-center justify-center hover:scale-110 transition-transform ring-2 ring-offset-2 ring-offset-background {formData.color ===
                                color
                                    ? 'ring-primary scale-110'
                                    : 'ring-transparent'}"
                            >
                                {#if formData.color === color}
                                    <Check
                                        class="h-4 w-4 text-white drop-shadow-md"
                                    />
                                {/if}
                            </button>
                        {/each}
                    </div>
                </div>
            </div>

            <Dialog.Footer>
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => (isDialogOpen = false)}>Cancel</Button
                >
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : isEditMode ? "Update" : "Create"}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
