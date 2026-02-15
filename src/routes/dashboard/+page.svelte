<script lang="ts">
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Badge } from "$lib/components/ui/badge";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as Sheet from "$lib/components/ui/sheet";
    import * as Pagination from "$lib/components/ui/pagination";
    import * as ScrollArea from "$lib/components/ui/scroll-area";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Separator } from "$lib/components/ui/separator";
    import * as Progress from "$lib/components/ui/progress";
    import { Calendar } from "$lib/components/ui/calendar";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import { userStore } from "$lib/stores/userStore.svelte";
    import {
        Plus,
        Edit,
        Check,
        MoreVertical,
        Clock,
        Tag,
        AlignLeft,
        CheckCircle2,
        ChevronRight,
        ChevronDown,
        Calendar as CalendarIcon,
        LayoutGrid,
        Search,
        Trash2,
        Eye,
        X,
        Hash,
        Loader2,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { taskService, type Task } from "$lib";
    import type { Category } from "$lib/types";
    import { categoryService } from "$lib/services/categoryService";

    // Task State
    let tasks = $state<Task[]>([]);
    let originalTaskData = $state<any>(null);
    let isSubmitting = $state(false);

    // Category State
    let categories = $state<Category[]>([]);

    $effect(() => {
        const userId = userStore.profile.ID;
        if (!userId) return;

        async function initDashboard() {
            try {
                isLoading = true;

                const [catRes, taskRes] = await Promise.all([
                    categoryService.getCategories(),
                    taskService.getTasks(),
                ]);

                if (catRes.success && taskRes.success) {
                    const allTasks = taskRes.data || [];
                    const allCats = catRes.data || [];

                    tasks = allTasks.map((task: Task) => ({
                        ID: task.ID,
                        title: task.title,
                        short_desc: task.short_desc,
                        long_desc: task.long_desc,
                        priority: task.priority,
                        tags: task.tags || [],
                        status: task.status,
                        due_date: task.due_date,
                        user_id: task.user_id,
                    }));

                    categories = allCats.map((cat: Category) => {
                        const taskCount = allTasks.filter(
                            (t: Task) => t.tags && t.tags.includes(cat.name),
                        ).length;

                        return {
                            ID: cat.ID,
                            name: cat.name,
                            color: cat.color,
                            count: taskCount,
                        };
                    });
                } else {
                    toast.error("Failed to sync data from server");
                }
            } catch (error) {
                console.error("Dashboard Init Error:", error);
                toast.error("An error occurred while loading your dashboard");
            } finally {
                isLoading = false;
            }
        }

        initDashboard();
    });

    // State Form Add Task
    let newTask = $state({
        text: "",
        desc: "",
        longDesc: "",
        priority: "Medium",
        due_date: "",
        tags: [] as string[],
    });
    let tagInput = $state("");

    let categorySearch = $state("");
    let selectedIds = $state<number[]>([]);
    let selectedTask = $state<any>(null);
    let isDetailOpen = $state(false);
    let isAddDialogOpen = $state(false);
    let isEditMode = $state(false);
    let editingTaskId = $state<number | null>(null);
    let isLoading = $state(true);

    let isDeleteDialogOpen = $state(false);
    let taskToDeleteId = $state<number | null>(null);

    function confirmDelete(id: number) {
        taskToDeleteId = id;
        isDeleteDialogOpen = true;
    }

    async function proceedDelete() {
        if (taskToDeleteId) {
            await deleteTask(taskToDeleteId);
            isDeleteDialogOpen = false;
            taskToDeleteId = null;
        }
    }

    // --- FILTERING & SORTING LOGIC ---

    // 1. Filter: Remove past tasks (keep today onwards + no date)
    const visibleTasks = $derived.by(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today (Local/Jakarta if browser is there)

        return tasks.filter((t: Task) => {
            if (!t.due_date) return true; // Keep no-date tasks
            // Parse due_date (ISO string)
            const taskDate = new Date(t.due_date);
            taskDate.setHours(0, 0, 0, 0); // Compare dates only

            // Show if:
            // 1. Not Done (Todo/Ongoing) -> Even if overdue.
            // 2. OR Date >= Today (Done tasks for today visible for progress).
            return t.status !== "done" || taskDate >= now;
        });
    });

    const isOverdue = (task: Task) => {
        if (!task.due_date || task.status === "done") return false;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate < now;
    };

    // 2. Sort: Ongoing > Due Date
    const sortedTasks = $derived.by(() => {
        return [...visibleTasks].sort((a, b) => {
            // Priority 1: Ongoing at top
            if (a.status === "ongoing" && b.status !== "ongoing") return -1;
            if (b.status === "ongoing" && a.status !== "ongoing") return 1;

            // Priority 2: Nearest Due Date
            const dateA = a.due_date
                ? new Date(a.due_date).getTime()
                : Number.MAX_SAFE_INTEGER;
            const dateB = b.due_date
                ? new Date(b.due_date).getTime()
                : Number.MAX_SAFE_INTEGER;

            return dateA - dateB;
        });
    });

    // 3. Display Tasks (Filter out 'done' for main list)
    const displayTasks = $derived(
        sortedTasks.filter((t) => t.status !== "done"),
    );

    // 3. Category Sync: Count ONLY visible tasks
    const syncedCategories = $derived.by(() => {
        return categories.map((cat) => {
            const count = visibleTasks.filter(
                (t) => t.tags && t.tags.includes(cat.name),
            ).length;
            return { ...cat, count };
        });
    });

    // Pagination
    let currentPage = $state(1);
    let perPage = 5;
    const count = $derived(displayTasks.length);
    const paginatedTasks = $derived(
        displayTasks.slice((currentPage - 1) * perPage, currentPage * perPage),
    );

    // Filter Categories for Sidebar Search
    const filteredCategories = $derived(
        syncedCategories.filter((cat) =>
            cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
        ),
    );

    // Progress
    const completedCount = $derived(
        visibleTasks.filter((t) => t.status === "done").length,
    );
    const progressPercent = $derived(
        visibleTasks.length > 0
            ? (completedCount / visibleTasks.length) * 100
            : 0,
    );

    // CRUD Handlers
    // SAVE (CREATE / UPDATE)
    async function handleSaveTask(e: Event) {
        e.preventDefault();

        if (isSubmitting) return;

        if (!newTask.text.trim()) {
            toast.error("Task title is required");
            return;
        }

        if (isEditMode && originalTaskData) {
            const isUnchanged =
                newTask.text === originalTaskData.text &&
                newTask.desc === originalTaskData.desc &&
                newTask.longDesc === originalTaskData.longDesc &&
                newTask.priority === originalTaskData.priority &&
                newTask.due_date === originalTaskData.due_date &&
                JSON.stringify(newTask.tags) ===
                    JSON.stringify(originalTaskData.tags);

            if (isUnchanged) {
                toast.info("No changes made.");
                isAddDialogOpen = false;
                return;
            }
        }

        const payload: any = {
            title: newTask.text,
            short_desc: newTask.desc,
            long_desc: newTask.longDesc,
            priority: newTask.priority,
            due_date:
                newTask.due_date && newTask.due_date !== ""
                    ? new Date(newTask.due_date).toISOString()
                    : null,
            tags: newTask.tags,
            status: isEditMode ? selectedTask.status : "todo",
        };

        try {
            isSubmitting = true;
            if (isEditMode && editingTaskId) {
                // UPDATE
                const res = await taskService.updateTask(
                    editingTaskId,
                    payload,
                );
                if (res.success) {
                    // Update Reassignment
                    tasks = tasks.map((t) =>
                        t.ID === editingTaskId
                            ? {
                                  ...t,
                                  title: payload.title,
                                  short_desc: payload.short_desc,
                                  long_desc: payload.long_desc,
                                  priority: payload.priority,
                                  due_date: payload.due_date,
                                  tags: payload.tags,
                                  status: payload.status,
                              }
                            : t,
                    );
                    toast.success("Task updated!");
                    isAddDialogOpen = false;
                } else {
                    toast.error("Update failed: " + res.message);
                }
            } else {
                const res = await taskService.createTask(payload);
                if (res.success && res.data) {
                    const newItem = res.data;
                    // Create Reassignment
                    tasks = [
                        ...tasks,
                        {
                            ID: newItem.ID,
                            title: newItem.title,
                            short_desc: newItem.short_desc,
                            long_desc: newItem.long_desc,
                            priority: newItem.priority,
                            tags: newItem.tags || [],
                            status: newItem.status,
                            due_date: newItem.due_date,
                            user_id: newItem.user_id,
                        },
                    ];
                    toast.success("Task created!");
                    isAddDialogOpen = false;
                } else {
                    toast.error("Create failed: " + res.message);
                }
            }
            newTask = {
                text: "",
                desc: "",
                longDesc: "",
                priority: "Medium",
                due_date: "",
                tags: [],
            };
            if (!isAddDialogOpen) {
                isEditMode = false;
                editingTaskId = null;
            }
        } catch (error) {
            console.error("Error saving task:", error);
            toast.error("Failed to save task");
        } finally {
            isSubmitting = false;
        }
    }

    // DELETE SINGLE
    async function deleteTask(id: number) {
        // if (!confirm("Delete this task?")) return; // Replaced with AlertDialog

        try {
            const res = await taskService.deleteTask([id]);
            if (res.success) {
                tasks = tasks.filter((t) => t.ID !== id);
                toast.success("Task deleted");
            } else {
                toast.error("Failed delete");
            }
        } catch (error) {
            toast.error("Error deleting");
        }
    }

    // DELETE BULK
    async function handleBulkDelete() {
        if (selectedIds.length === 0) return;

        const confirmDelete = confirm(`Delete ${selectedIds.length} tasks?`);
        if (!confirmDelete) return;

        try {
            const res = await taskService.deleteTask(selectedIds);

            if (res.success) {
                tasks = tasks.filter((t) => !selectedIds.includes(t.ID));
                selectedIds = [];
                toast.success("Tasks deleted successfully");
            } else {
                toast.error(res.message || "Failed to delete tasks");
            }
        } catch (error) {
            console.error("Bulk Delete Error:", error);
            toast.error("A system error occurred during deletion");
        }
    }

    // TOGGLE STATUS (3-State)
    async function updateStatus(task: Task, newStatus: string) {
        try {
            const res = await taskService.updateTask(task.ID, {
                status: newStatus,
            } as any);

            if (res.success) {
                // Svelte 5 Reassignment
                tasks = tasks.map((t) =>
                    t.ID === task.ID ? { ...t, status: newStatus } : t,
                );

                let msg = "";
                if (newStatus === "done") msg = "Task completed! 🎉";
                else if (newStatus === "ongoing") msg = "Task started 🚀";
                else msg = "Task moved to Todo";

                toast.success(msg);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    // BULK STATUS UPDATE
    async function bulkUpdateStatus(status: string) {
        try {
            const res = await taskService.updateBatchStatus(
                selectedIds,
                status,
            );
            if (res.success) {
                tasks = tasks.map((t) => {
                    if (selectedIds.includes(t.ID)) {
                        return { ...t, status: status };
                    }
                    return t;
                });
                selectedIds = [];
                toast.success(`Selected tasks marked as ${status}`);
            }
        } catch (error) {
            toast.error("Failed bulk update");
        }
    }

    // --- UI HELPERS ---
    function openDetail(task: any) {
        selectedTask = task;
        isDetailOpen = true;
    }

    function openEditDialog(task: any) {
        isDetailOpen = false;

        setTimeout(() => {
            isEditMode = true;
            editingTaskId = task.ID;

            let formattedDate = "";
            if (task.due_date) {
                if (task.due_date.length >= 16) {
                    formattedDate = task.due_date.substring(0, 16);
                } else if (task.due_date.length === 10) {
                    formattedDate = `${task.due_date}T09:00`;
                }
            }

            newTask = {
                text: task.title,
                desc: task.short_desc,
                longDesc: task.long_desc || "",
                priority: task.priority,
                due_date: formattedDate,
                tags: [...(task.tags || [])],
            };

            originalTaskData = JSON.parse(JSON.stringify(newTask));

            isAddDialogOpen = true;
        }, 350);
    }

    function toggleTag(tagName: string) {
        if (newTask.tags.includes(tagName)) {
            newTask.tags = newTask.tags.filter((t) => t !== tagName);
        } else {
            newTask.tags = [...newTask.tags, tagName];
        }
    }

    function addCustomTag(e: KeyboardEvent) {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!newTask.tags.includes(tagInput.trim())) {
                newTask.tags = [...newTask.tags, tagInput.trim()];
            }
            tagInput = "";
        }
    }

    const priorityColor = (p: string) => {
        if (p === "High") return "bg-red-500/10 text-red-500 border-red-500/20";
        if (p === "Medium")
            return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    };
</script>

{#snippet paginationControl()}
    <Pagination.Root {count} {perPage} bind:page={currentPage}>
        {#snippet children({ pages, currentPage })}
            <Pagination.Content>
                <Pagination.Item><Pagination.Previous /></Pagination.Item>
                {#each pages as page (page.key)}
                    {#if page.type === "ellipsis"}
                        <Pagination.Item
                            ><Pagination.Ellipsis /></Pagination.Item
                        >
                    {:else}
                        <Pagination.Item>
                            <Pagination.Link
                                {page}
                                isActive={currentPage === page.value}
                                >{page.value}</Pagination.Link
                            >
                        </Pagination.Item>
                    {/if}
                {/each}
                <Pagination.Item><Pagination.Next /></Pagination.Item>
            </Pagination.Content>
        {/snippet}
    </Pagination.Root>
{/snippet}

<div class="w-full pb-8 px-2 md:px-6 bg-background min-h-screen pt-4">
    <div class="flex items-center justify-between gap-4 mb-8">
        <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
                Dashboard
            </h1>
            <p class="text-muted-foreground text-[10px] md:text-sm font-medium">
                Welcome back! You have <span class="font-bold text-foreground"
                    >{visibleTasks.length - completedCount} tasks</span
                > left today.
            </p>
        </div>
        <Button
            size="sm"
            onclick={() => {
                isEditMode = false;
                newTask = {
                    text: "",
                    desc: "",
                    longDesc: "",
                    priority: "Medium",
                    due_date: "",
                    tags: [],
                };
                isAddDialogOpen = true;
            }}
        >
            <Plus class="mr-1 h-4 w-4" />
            <span class="hidden md:inline">Add Task</span><span
                class="md:hidden text-xs">Add</span
            >
        </Button>
    </div>

    <div
        class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start lg:items-stretch"
    >
        <div class="lg:col-span-8 flex flex-col gap-6 h-full">
            <Card.Root class="border-none bg-muted/20 shadow-none shrink-0">
                <Card.Content class="p-6 space-y-3">
                    {#if visibleTasks.length > 0}
                        <div
                            class="flex items-center justify-between text-sm font-bold"
                        >
                            <div class="flex items-center gap-2">
                                <CheckCircle2 class="h-4 w-4 text-primary" /> Progress
                            </div>
                            <span>{Math.round(progressPercent)}% Done</span>
                        </div>

                        <Progress.Root value={progressPercent} class="h-2" />
                    {/if}
                    {#if visibleTasks.length === 0}
                        <div
                            class="flex flex-col items-center justify-center py-8 text-center space-y-3 opacity-60"
                        >
                            <div class="bg-primary/10 p-4 rounded-full">
                                <CheckCircle2 class="h-8 w-8 text-primary" />
                            </div>
                            <div class="space-y-1">
                                <h3 class="font-bold text-lg">All done!</h3>
                                <p class="text-sm text-muted-foreground">
                                    No pending tasks for today.
                                </p>
                            </div>
                        </div>
                    {/if}
                </Card.Content>
            </Card.Root>

            <div class="flex flex-col gap-3 flex-1">
                {#if isLoading}
                    {#each Array(5) as _}
                        <div
                            class="flex items-center space-x-4 p-4 border rounded-xl bg-card"
                        >
                            <Skeleton class="h-5 w-5 rounded-md" />
                            <div class="space-y-2 flex-1">
                                <Skeleton class="h-4 w-[60%]" />
                                <Skeleton class="h-3 w-[40%]" />
                            </div>
                            <Skeleton class="h-8 w-8 rounded-full" />
                        </div>
                    {/each}
                {:else}
                    {#each paginatedTasks as task (task.ID)}
                        <Card.Root
                            class="group transition-all {task.status === 'done'
                                ? 'bg-muted/40 opacity-70'
                                : task.status === 'ongoing'
                                  ? 'bg-blue-500/5 border-l-4 border-l-blue-500 shadow-md'
                                  : 'bg-card'}"
                        >
                            <Card.Content class="p-0 flex items-stretch">
                                <div
                                    class="px-3 md:px-4 flex items-center border-r shrink-0"
                                >
                                    <Checkbox
                                        checked={selectedIds.includes(task.ID)}
                                        onCheckedChange={(v) => {
                                            if (v)
                                                selectedIds = [
                                                    ...selectedIds,
                                                    task.ID,
                                                ];
                                            else
                                                selectedIds =
                                                    selectedIds.filter(
                                                        (id) => id !== task.ID,
                                                    );
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    class="flex-1 p-3 md:p-4 text-left focus:outline-none flex items-center justify-between gap-4 min-w-0"
                                    onclick={() => openDetail(task)}
                                >
                                    <div class="flex-1 min-w-0">
                                        <div
                                            class="flex items-center gap-2 mb-1"
                                        >
                                            <h3
                                                class="text-sm md:text-base font-semibold truncate {task.status ===
                                                'done'
                                                    ? 'line-through text-muted-foreground'
                                                    : ''}"
                                            >
                                                {task.title}
                                            </h3>
                                            {#if task.status === "ongoing"}
                                                <Badge
                                                    class="bg-blue-500 text-[8px] h-4 px-1 animate-pulse"
                                                    >ONGOING</Badge
                                                >
                                            {/if}
                                            {#if isOverdue(task)}
                                                <Badge
                                                    variant="destructive"
                                                    class="text-[8px] h-4 px-1 animate-pulse"
                                                    >LATE</Badge
                                                >
                                            {/if}
                                            <div class="flex gap-1 shrink-0">
                                                {#each task.tags.slice(0, 1) as t}
                                                    <Badge
                                                        variant="secondary"
                                                        class="text-[8px] px-1.5 h-4 font-bold uppercase"
                                                        >{t}</Badge
                                                    >
                                                {/each}
                                            </div>
                                            {#if task.long_desc}
                                                <AlignLeft
                                                    class="h-3 w-3 text-muted-foreground/50 ml-1"
                                                />
                                            {/if}
                                        </div>
                                        {#if task.short_desc}
                                            <p
                                                class="text-muted-foreground text-[10px] md:text-xs italic line-clamp-1"
                                            >
                                                "{task.short_desc}"
                                            </p>
                                        {/if}
                                    </div>
                                    <div
                                        class="w-[85px] md:w-[120px] flex items-center justify-between shrink-0 border-l pl-3 md:pl-4"
                                    >
                                        <div
                                            class="flex flex-col items-center gap-1 w-full"
                                        >
                                            <Badge
                                                variant="outline"
                                                class="font-bold text-[8px] md:text-[9px] uppercase {priorityColor(
                                                    task.priority,
                                                )}">{task.priority}</Badge
                                            >
                                            <div
                                                class="flex items-center gap-1 text-[9px] text-muted-foreground font-bold font-mono"
                                            >
                                                {#if task.due_date}
                                                    <Clock class="h-3 w-3" />
                                                    {new Date(
                                                        task.due_date,
                                                    ).toLocaleTimeString(
                                                        "en-US",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )}
                                                {/if}
                                            </div>
                                        </div>
                                        <ChevronRight
                                            class="h-4 w-4 text-muted-foreground hidden md:block opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                        />
                                    </div>
                                </button>
                                <div
                                    class="pr-2 flex items-center border-l md:border-none"
                                >
                                    <DropdownMenu.Root>
                                        <DropdownMenu.Trigger
                                            ><Button
                                                variant="ghost"
                                                size="icon"
                                                class="h-8 w-8 rounded-full"
                                                ><MoreVertical
                                                    class="h-4 w-4"
                                                /></Button
                                            ></DropdownMenu.Trigger
                                        >
                                        <DropdownMenu.Content
                                            align="end"
                                            class="w-40"
                                        >
                                            <DropdownMenu.Item
                                                onclick={() => openDetail(task)}
                                                ><Eye class="mr-2 h-4 w-4" /> View
                                                Details</DropdownMenu.Item
                                            >
                                            <DropdownMenu.Item
                                                onclick={() =>
                                                    openEditDialog(task)}
                                                ><Edit class="mr-2 h-4 w-4" /> Edit
                                                Task</DropdownMenu.Item
                                            >

                                            {#if task.status === "todo"}
                                                <DropdownMenu.Item
                                                    onclick={() =>
                                                        updateStatus(
                                                            task,
                                                            "ongoing",
                                                        )}
                                                >
                                                    <Clock
                                                        class="mr-2 h-4 w-4"
                                                    />
                                                    Start Task
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item
                                                    onclick={() =>
                                                        updateStatus(
                                                            task,
                                                            "done",
                                                        )}
                                                >
                                                    <Check
                                                        class="mr-2 h-4 w-4"
                                                    />
                                                    Mark Done
                                                </DropdownMenu.Item>
                                            {:else if task.status === "ongoing"}
                                                <DropdownMenu.Item
                                                    onclick={() =>
                                                        updateStatus(
                                                            task,
                                                            "todo",
                                                        )}
                                                >
                                                    <X class="mr-2 h-4 w-4" />
                                                    Mark Todo
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item
                                                    onclick={() =>
                                                        updateStatus(
                                                            task,
                                                            "done",
                                                        )}
                                                >
                                                    <Check
                                                        class="mr-2 h-4 w-4"
                                                    />
                                                    Mark Done
                                                </DropdownMenu.Item>
                                            {:else}
                                                <DropdownMenu.Item
                                                    onclick={() =>
                                                        updateStatus(
                                                            task,
                                                            "todo",
                                                        )}
                                                >
                                                    <X class="mr-2 h-4 w-4" />
                                                    Mark Todo
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item
                                                    onclick={() =>
                                                        updateStatus(
                                                            task,
                                                            "ongoing",
                                                        )}
                                                >
                                                    <Clock
                                                        class="mr-2 h-4 w-4"
                                                    />
                                                    Mark Ongoing
                                                </DropdownMenu.Item>
                                            {/if}

                                            <DropdownMenu.Separator />
                                            <DropdownMenu.Item
                                                class="text-destructive font-bold"
                                                onclick={() =>
                                                    confirmDelete(task.ID)}
                                                ><Trash2 class="mr-2 h-4 w-4" />
                                                Delete Task</DropdownMenu.Item
                                            >
                                        </DropdownMenu.Content>
                                    </DropdownMenu.Root>
                                </div>
                            </Card.Content>
                        </Card.Root>
                    {/each}
                {/if}
            </div>

            <div
                class="hidden md:flex pt-6 justify-center border-t bg-background mt-auto shrink-0"
            >
                {@render paginationControl()}
            </div>
        </div>

        <div class="lg:col-span-4 space-y-6 h-full">
            <Card.Root>
                <Card.Header class="pb-3 border-b bg-muted/10">
                    <Card.Title
                        class="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground"
                        ><CalendarIcon class="h-4 w-4" /> Calendar</Card.Title
                    >
                </Card.Header>
                <Card.Content class="p-4 flex justify-center">
                    <Calendar
                        type="single"
                        class="rounded-md border-none shadow-none"
                    />
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-3 border-b bg-muted/10 space-y-3">
                    <Card.Title
                        class="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground"
                        ><LayoutGrid class="h-4 w-4" /> Categories</Card.Title
                    >
                    <div class="relative">
                        <Search
                            class="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground"
                        />
                        <Input
                            placeholder="Search labels..."
                            bind:value={categorySearch}
                            class="h-8 pl-7 text-[10px] bg-background shadow-none border-dashed"
                        />
                    </div>
                </Card.Header>
                <Card.Content class="p-0">
                    <ScrollArea.Root class="max-h-[250px]">
                        <div class="p-2 space-y-0.5">
                            {#each filteredCategories as cat}
                                <button
                                    class="w-full flex items-center justify-between text-xs p-2.5 hover:bg-muted rounded-md transition-colors font-bold group"
                                >
                                    <span class="flex items-center gap-2"
                                        ><div
                                            class="h-2 w-2 rounded-full {cat.color}"
                                        ></div>
                                        {cat.name}</span
                                    >
                                    <Badge
                                        variant="secondary"
                                        class="group-hover:bg-primary group-hover:text-primary-foreground text-[10px]"
                                        >{cat.count}</Badge
                                    >
                                </button>
                            {/each}
                        </div>
                    </ScrollArea.Root>
                </Card.Content>
            </Card.Root>
        </div>
    </div>
</div>

<Dialog.Root bind:open={isAddDialogOpen}>
    <Dialog.Content class="sm:max-w-[550px] p-0 overflow-hidden bg-background">
        <form onsubmit={handleSaveTask}>
            <div class="p-6 space-y-6">
                <header>
                    <Dialog.Title class="text-2xl font-bold"
                        >{isEditMode ? "Edit Task" : "New Task"}</Dialog.Title
                    >
                    <Dialog.Description
                        >{isEditMode
                            ? "Update your task details."
                            : "Create a detailed todo item."}</Dialog.Description
                    >
                </header>

                <div class="space-y-5">
                    <div class="grid gap-2">
                        <Label
                            for="title"
                            class="text-[10px] uppercase font-black text-muted-foreground tracking-widest"
                            >Title</Label
                        >
                        <Input
                            id="title"
                            bind:value={newTask.text}
                            placeholder="What needs to be done?"
                            required
                            class="text-lg font-bold bg-muted/20"
                        />
                    </div>

                    <div class="grid gap-2">
                        <Label
                            for="desc"
                            class="text-[10px] uppercase font-black text-muted-foreground tracking-widest"
                            >Short Description</Label
                        >
                        <Input
                            id="desc"
                            bind:value={newTask.desc}
                            placeholder="Dashboard card summary..."
                            class="bg-muted/10 border-dashed"
                        />
                    </div>

                    <div class="grid gap-3">
                        <Label
                            class="text-[10px] uppercase font-black text-muted-foreground tracking-widest"
                            >Labels</Label
                        >

                        <div
                            class="flex flex-wrap gap-2 p-3 bg-muted/20 rounded-xl border border-dashed min-h-14 items-center"
                        >
                            {#each newTask.tags as t}
                                <Badge
                                    variant="secondary"
                                    class="gap-1 pl-2 font-bold uppercase text-[10px] animate-in zoom-in-95"
                                >
                                    {t}
                                    <button
                                        type="button"
                                        onclick={() => toggleTag(t)}
                                        class="hover:text-destructive"
                                        ><X class="h-3 w-3" /></button
                                    >
                                </Badge>
                            {:else}
                                <span
                                    class="text-xs text-muted-foreground/50 italic px-1"
                                    >Pick from suggestions or type new...</span
                                >
                            {/each}
                        </div>

                        <div class="space-y-2">
                            <p
                                class="text-[9px] font-bold text-muted-foreground/70 flex items-center gap-1"
                            >
                                <Hash class="h-3 w-3" /> SUGGESTED
                            </p>
                            <div class="flex flex-wrap gap-1.5">
                                {#each categories as cat}
                                    <button
                                        type="button"
                                        onclick={() => toggleTag(cat.name)}
                                        class="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all
                                    {newTask.tags.includes(cat.name)
                                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                            : 'bg-background hover:border-primary text-muted-foreground'}"
                                    >
                                        {cat.name}
                                    </button>
                                {/each}
                                <div
                                    class="flex items-center border-l pl-2 ml-1"
                                >
                                    <input
                                        placeholder="+ New Label"
                                        class="bg-transparent outline-none text-[10px] w-20 font-medium placeholder:italic"
                                        bind:value={tagInput}
                                        onkeydown={addCustomTag}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="grid gap-2">
                            <Label
                                for="due_date"
                                class="text-[10px] uppercase font-black text-muted-foreground"
                                >Due Date</Label
                            >
                            <div class="relative">
                                <Input
                                    id="due_date"
                                    type="datetime-local"
                                    bind:value={newTask.due_date}
                                    class="bg-muted/10 custom-time-input"
                                />
                            </div>
                        </div>
                        <div class="grid gap-2">
                            <Label
                                for="priority"
                                class="text-[10px] uppercase font-black text-muted-foreground"
                                >Priority</Label
                            >
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger
                                    class={buttonVariants({
                                        variant: "outline",
                                    }) +
                                        " w-full !justify-between bg-muted/10 border-input font-normal hover:bg-muted/20 capitalize"}
                                >
                                    {newTask.priority}
                                    <ChevronDown
                                        class="ml-2 h-4 w-4 opacity-50"
                                    />
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content
                                    class="w-[200px] bg-background border shadow-xl"
                                >
                                    <DropdownMenu.RadioGroup
                                        bind:value={newTask.priority}
                                    >
                                        <DropdownMenu.RadioItem value="High"
                                            >High</DropdownMenu.RadioItem
                                        >
                                        <DropdownMenu.RadioItem value="Medium"
                                            >Medium</DropdownMenu.RadioItem
                                        >
                                        <DropdownMenu.RadioItem value="Low"
                                            >Low</DropdownMenu.RadioItem
                                        >
                                    </DropdownMenu.RadioGroup>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        </div>
                    </div>

                    <div class="grid gap-2">
                        <Label
                            for="longDesc"
                            class="text-[10px] uppercase font-black text-muted-foreground"
                            >Detailed Description</Label
                        >
                        <Textarea
                            id="longDesc"
                            bind:value={newTask.longDesc}
                            placeholder="Full context here..."
                            rows={4}
                            class="bg-muted/10 resize-none"
                        />
                    </div>
                </div>
            </div>
            <Dialog.Footer class="bg-muted/30 p-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => (isAddDialogOpen = false)}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    class="font-bold shadow-md"
                    disabled={isSubmitting}
                >
                    {#if isSubmitting}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Saving..."}
                    {:else}
                        {isEditMode ? "Update Changes" : "Save Task"}
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>

<Sheet.Root bind:open={isDetailOpen}>
    <Sheet.Content
        side="right"
        class="w-full sm:max-w-xl p-0 flex flex-col border-l-2 bg-background"
    >
        {#if selectedTask}
            <div class="flex-1 overflow-y-auto p-10 space-y-8 mt-4">
                <header class="space-y-4">
                    <Badge
                        class="px-3 py-0.5 text-[10px] font-black {priorityColor(
                            selectedTask.priority,
                        )}">{selectedTask.priority} PRIORITY</Badge
                    >
                    <Sheet.Title class="text-3xl font-bold tracking-tight"
                        >{selectedTask.title}</Sheet.Title
                    >
                    <div
                        class="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase border-t pt-4"
                    >
                        <span class="flex items-center gap-1.5"
                            ><CalendarIcon class="h-4 w-4 text-primary" />
                            {selectedTask.due_date
                                ? new Date(
                                      selectedTask.due_date,
                                  ).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                  })
                                : "No Date"}</span
                        >
                        <span class="flex items-center gap-1.5"
                            ><Clock class="h-4 w-4 text-primary" />
                            {selectedTask.due_date
                                ? new Date(
                                      selectedTask.due_date,
                                  ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  })
                                : "--:--"}</span
                        >
                    </div>
                </header>

                <section class="space-y-4 border-t pt-4 mt-4">
                    <div
                        class="text-[10px] font-black uppercase text-primary tracking-widest"
                    >
                        Update Status
                    </div>
                    <div class="flex gap-2">
                        <Button
                            variant={selectedTask.status === "todo"
                                ? "default"
                                : "outline"}
                            size="sm"
                            onclick={() => updateStatus(selectedTask, "todo")}
                            >Todo</Button
                        >
                        <Button
                            variant={selectedTask.status === "ongoing"
                                ? "default"
                                : "outline"}
                            size="sm"
                            class={selectedTask.status === "ongoing"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : ""}
                            onclick={() =>
                                updateStatus(selectedTask, "ongoing")}
                            >Ongoing</Button
                        >
                        <Button
                            variant={selectedTask.status === "done"
                                ? "default"
                                : "outline"}
                            size="sm"
                            class={selectedTask.status === "done"
                                ? "bg-green-600 hover:bg-green-700"
                                : ""}
                            onclick={() => updateStatus(selectedTask, "done")}
                            >Done</Button
                        >
                    </div>
                </section>

                {#if selectedTask.long_desc}
                    <section class="space-y-4 border-t pt-4 mt-4">
                        <div
                            class="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary"
                        >
                            <AlignLeft class="h-4 w-4" /> Context
                        </div>
                        <div
                            class="text-sm leading-relaxed text-muted-foreground bg-muted/20 p-6 rounded-2xl border-2 border-dashed border-muted italic font-medium"
                        >
                            "{selectedTask.long_desc}"
                        </div>
                    </section>
                {/if}

                <section class="space-y-4 border-t pt-4 mt-4">
                    <div
                        class="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary"
                    >
                        <Tag class="h-4 w-4" /> Labels
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each selectedTask.tags as t}
                            <Badge
                                variant="secondary"
                                class="font-bold uppercase text-[10px] border"
                                >{t}</Badge
                            >
                        {:else}
                            <span class="text-xs text-muted-foreground italic"
                                >No labels assigned.</span
                            >
                        {/each}
                    </div>
                </section>
            </div>

            <div class="p-6 border-t flex gap-3 bg-muted/5">
                <Button
                    variant="outline"
                    class="flex-1"
                    onclick={() => (isDetailOpen = false)}
                >
                    Close
                </Button>
                <Button
                    class="flex-1 font-bold shadow-md"
                    onclick={() => openEditDialog(selectedTask)}
                >
                    <Edit class="mr-2 h-4 w-4" /> Edit Task
                </Button>
            </div>
        {/if}
    </Sheet.Content>
</Sheet.Root>

{#if selectedIds.length > 0}
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div
            class="bg-primary text-primary-foreground px-4 md:px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 md:gap-4 border border-border"
        >
            <span
                class="text-xs md:text-sm font-bold tracking-tight uppercase whitespace-nowrap"
            >
                {selectedIds.length} Selected
            </span>

            <Separator
                orientation="vertical"
                class="h-4 bg-primary-foreground/30 hidden md:block"
            />

            <div class="flex items-center gap-1 md:gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    class="h-8 rounded-full font-bold px-3 text-[10px] md:text-xs"
                    onclick={() => bulkUpdateStatus("ongoing")}
                >
                    <Clock class="mr-1 h-3 w-3" /> Start
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    class="h-8 rounded-full font-bold px-3 text-[10px] md:text-xs"
                    onclick={() => bulkUpdateStatus("done")}
                >
                    <Check class="mr-1 h-3 w-3" /> Done
                </Button>
            </div>

            <Button
                variant="destructive"
                size="sm"
                class="h-8 rounded-full font-black px-3 text-[10px] md:text-xs hover:bg-destructive/90"
                onclick={handleBulkDelete}
            >
                <Trash2 class="h-3 w-3 md:mr-2" />
                <span class="hidden md:inline">Delete</span>
            </Button>
        </div>
    </div>
{/if}

<AlertDialog.Root bind:open={isDeleteDialogOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
            <AlertDialog.Description>
                This action cannot be undone. This will permanently delete the
                task from our servers.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onclick={proceedDelete}>Delete</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
