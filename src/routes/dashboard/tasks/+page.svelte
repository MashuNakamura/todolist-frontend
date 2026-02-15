<script lang="ts">
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Badge } from "$lib/components/ui/badge";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as Sheet from "$lib/components/ui/sheet";
    import * as Pagination from "$lib/components/ui/pagination";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Select from "$lib/components/ui/select";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Separator } from "$lib/components/ui/separator";
    import {
        Plus,
        Edit,
        Check,
        MoreVertical,
        Clock,
        Tag,
        AlignLeft,
        CheckCircle2,
        ChevronDown,
        Calendar as CalendarIcon,
        Search,
        Trash2,
        Eye,
        X,
        Filter,
        ListFilter,
        Loader2,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { taskService } from "$lib/services/taskService";
    import { categoryService } from "$lib/services/categoryService";
    import { userStore } from "$lib/stores/userStore.svelte";
    import type { Task, Category } from "$lib/types";

    // --- 1. STATE ---
    let tasks = $state<Task[]>([]);
    let categories = $state<Category[]>([]);
    let isLoading = $state(true);
    let isSubmitting = $state(false);

    // Filter States
    let searchQuery = $state("");
    let priorityFilter = $state("all"); // 'all', 'High', 'Medium', 'Low'

    // Selection & Dialog States
    let newTask = $state({
        text: "",
        desc: "", // Maps to short_desc
        longDesc: "", // Maps to long_desc
        priority: "Medium",
        due_date: "",
        tags: [] as string[],
    });
    let tagInput = $state("");

    // Selection & Dialog States
    let selectedTask = $state<Task | null>(null);
    let isDetailOpen = $state(false);
    let isAddDialogOpen = $state(false);
    let isEditMode = $state(false);
    let editingTaskId = $state<number | null>(null);

    // Delete Confirmation State
    let isDeleteDialogOpen = $state(false);
    let taskToDeleteId = $state<number | null>(null);

    // --- 2. FETCH DATA ---
    $effect(() => {
        const userId = userStore.profile?.ID;
        if (!userId) return;

        async function init() {
            try {
                const [taskRes, catRes] = await Promise.all([
                    taskService.getTasks(),
                    categoryService.getCategories(),
                ]);

                if (taskRes.success) tasks = taskRes.data || [];
                if (catRes.success) categories = catRes.data || [];
            } catch (error) {
                console.error("Failed to load tasks", error);
                toast.error("Failed to load data");
            } finally {
                isLoading = false;
            }
        }
        init();
    });

    // --- 3. LOGIC ---
    // Filter Logic
    const baseTasks = $derived(
        tasks.filter((t) => {
            const matchesSearch =
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.short_desc &&
                    t.short_desc
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()));

            const matchesPriority =
                priorityFilter === "all" ? true : t.priority === priorityFilter;

            return matchesSearch && matchesPriority;
        }),
    );

    // Grouping for Kanban
    const columns = $derived({
        todo: baseTasks.filter((t) => t.status === "todo"),
        ongoing: baseTasks.filter((t) => t.status === "ongoing"),
        done: baseTasks.filter((t) => t.status === "done"),
    });

    // Helper: Check if Overdue
    const isOverdue = (task: Task) => {
        if (!task.due_date || task.status === "done") return false;
        return new Date(task.due_date) < new Date();
    };

    // --- 4. HANDLERS ---
    function openDetail(task: Task) {
        selectedTask = task;
        isDetailOpen = true;
    }

    function confirmDelete(id: number) {
        taskToDeleteId = id;
        isDeleteDialogOpen = true;
    }

    async function proceedDelete() {
        if (!taskToDeleteId) return;

        const id = taskToDeleteId;
        const res = await taskService.deleteTask([id]);

        if (res.success) {
            tasks = tasks.filter((t) => t.ID !== id);
            toast.success("Task deleted");
            // Close detail if deleted task was open
            if (selectedTask?.ID === id) isDetailOpen = false;
        } else {
            toast.error("Failed to delete task");
        }

        isDeleteDialogOpen = false;
        taskToDeleteId = null;
    }

    async function updateStatus(task: Task, newStatus: string) {
        // Optimistic UI Update
        const originalTasks = [...tasks];
        tasks = tasks.map((t) =>
            t.ID === task.ID ? { ...t, status: newStatus } : t,
        );

        try {
            const res = await taskService.updateTask(task.ID, {
                status: newStatus,
            } as any);
            if (res.success) {
                let msg = "";
                if (newStatus === "done") msg = "Task completed!";
                else if (newStatus === "ongoing") msg = "Task started";
                else msg = "Task moved to Todo";

                toast.success(msg);

                // Update selectedTask if open to reflect changes
                if (selectedTask?.ID === task.ID) {
                    selectedTask = { ...selectedTask, status: newStatus };
                }
            } else {
                tasks = originalTasks; // Rollback
                toast.error("Failed to update status");
            }
        } catch (e) {
            tasks = originalTasks;
            toast.error("Update failed");
        }
    }

    // Tag & Form Handlers
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

    function openEditDialog(task: Task) {
        isEditMode = true;
        editingTaskId = task.ID;
        newTask = {
            text: task.title,
            desc: task.short_desc || "",
            longDesc: task.long_desc || "",
            priority: task.priority,
            due_date: task.due_date ? task.due_date.substring(0, 16) : "",
            tags: [...(task.tags || [])],
        };
        isAddDialogOpen = true;
        isDetailOpen = false;
    }

    function openAddDialog() {
        isEditMode = false;
        editingTaskId = null;
        newTask = {
            text: "",
            desc: "",
            longDesc: "",
            priority: "Medium",
            due_date: "",
            tags: [],
        };
        isAddDialogOpen = true;
    }

    async function handleSaveTask(e: Event) {
        e.preventDefault();

        if (isSubmitting) return;

        const payload = {
            title: newTask.text,
            short_desc: newTask.desc,
            long_desc: newTask.longDesc,
            priority: newTask.priority,
            tags: newTask.tags,
            due_date: newTask.due_date
                ? new Date(newTask.due_date).toISOString()
                : null,
            status: isEditMode
                ? tasks.find((t) => t.ID === editingTaskId)?.status
                : "todo",
        };

        try {
            isSubmitting = true;

            if (isEditMode && editingTaskId) {
                const res = await taskService.updateTask(
                    editingTaskId,
                    payload as any,
                );
                if (res.success && res.data) {
                    tasks = tasks.map((t) =>
                        t.ID === editingTaskId ? { ...t, ...res.data } : t,
                    );
                    toast.success("Task updated");
                }
                isAddDialogOpen = false;
            } else {
                const res = await taskService.createTask(payload as any);
                if (res.success && res.data) {
                    tasks = [...tasks, res.data]; // Immutable update
                    toast.success("Task created");
                }
            }
            isAddDialogOpen = false;
        } catch (error) {
            toast.error("Failed to save task");
        } finally {
            isSubmitting = false;
        }
    }

    const priorityColor = (p: string) => {
        if (p === "High") return "bg-red-500/10 text-red-500 border-red-500/20";
        if (p === "Medium")
            return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    };
</script>

<div
    class="w-full px-2 md:px-6 bg-background min-h-screen lg:min-h-0 lg:h-full pt-4 pb-20 lg:pb-4 flex flex-col lg:overflow-hidden"
>
    <div class="flex items-center justify-between gap-4 mb-4 lg:mb-8 shrink-0">
        <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
                All Tasks
            </h1>
            <p class="text-muted-foreground text-[10px] md:text-sm font-medium">
                Manage and filter your complete task history.
            </p>
        </div>
        <Button size="sm" onclick={openAddDialog}>
            <Plus class="mr-1 h-4 w-4" />
            <span class="hidden md:inline">Create Task</span><span
                class="md:hidden text-xs">Add</span
            >
        </Button>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-6 shrink-0">
        <div class="relative flex-1">
            <Search
                class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            />
            <Input
                placeholder="Search tasks..."
                class="pl-9 bg-card"
                bind:value={searchQuery}
            />
        </div>
        <div class="flex gap-2 shrink-0">
            <div class="w-[130px]">
                <Select.Root type="single" bind:value={priorityFilter}>
                    <Select.Trigger class="bg-card"
                        >{priorityFilter === "all"
                            ? "All Priority"
                            : priorityFilter}</Select.Trigger
                    >
                    <Select.Content>
                        <Select.Item value="all">All Priority</Select.Item>
                        <Select.Item value="High">High</Select.Item>
                        <Select.Item value="Medium">Medium</Select.Item>
                        <Select.Item value="Low">Low</Select.Item>
                    </Select.Content>
                </Select.Root>
            </div>
        </div>
    </div>

    <div
        class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:flex-1 lg:min-h-0 lg:h-full"
    >
        <!-- TODO COLUMN -->
        <div class="flex flex-col gap-4 lg:h-full lg:overflow-hidden">
            <div
                class="flex items-center justify-between pb-2 border-b shrink-0"
            >
                <h2
                    class="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2"
                >
                    <div
                        class="h-2 w-2 rounded-full bg-muted-foreground/50"
                    ></div>
                    Todo
                    <Badge
                        variant="secondary"
                        class="ml-1 text-[10px] h-5 px-1.5"
                        >{columns.todo.length}</Badge
                    >
                </h2>
            </div>
            <div
                class="flex flex-col gap-3 lg:flex-1 lg:overflow-y-auto lg:min-h-0 lg:pr-2 custom-scrollbar"
            >
                {#each columns.todo as task (task.ID)}
                    {@render taskCard(task, "todo")}
                {/each}
                {#if columns.todo.length === 0}
                    <div
                        class="h-32 rounded-xl border-2 border-dashed flex items-center justify-center text-muted-foreground/50 text-xs italic bg-muted/5 shrink-0"
                    >
                        No tasks
                    </div>
                {/if}
            </div>
        </div>

        <!-- ONGOING COLUMN -->
        <div class="flex flex-col gap-4 lg:h-full lg:overflow-hidden">
            <div
                class="flex items-center justify-between pb-2 border-b border-blue-500/30 shrink-0"
            >
                <h2
                    class="font-bold text-sm uppercase tracking-wider text-blue-500 flex items-center gap-2"
                >
                    <div
                        class="h-2 w-2 rounded-full bg-blue-500 animate-pulse"
                    ></div>
                    Ongoing
                    <Badge
                        variant="outline"
                        class="ml-1 text-[10px] h-5 px-1.5 border-blue-500/30 text-blue-500"
                        >{columns.ongoing.length}</Badge
                    >
                </h2>
            </div>
            <div
                class="flex flex-col gap-3 lg:flex-1 lg:overflow-y-auto lg:min-h-0 lg:pr-2 custom-scrollbar"
            >
                {#each columns.ongoing as task (task.ID)}
                    {@render taskCard(task, "ongoing")}
                {/each}
                {#if columns.ongoing.length === 0}
                    <div
                        class="h-32 rounded-xl border-2 border-dashed border-blue-500/20 flex flex-col items-center justify-center text-blue-500/50 text-xs italic bg-blue-500/5 shrink-0"
                    >
                        <Clock class="h-8 w-8 mb-2 opacity-50" /> No active focus
                    </div>
                {/if}
            </div>
        </div>

        <!-- DONE COLUMN -->
        <div class="flex flex-col gap-4 lg:h-full lg:overflow-hidden">
            <div
                class="flex items-center justify-between pb-2 border-b shrink-0"
            >
                <h2
                    class="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2"
                >
                    <div class="h-2 w-2 rounded-full bg-green-500/50"></div>
                    Completed
                    <Badge
                        variant="secondary"
                        class="ml-1 text-[10px] h-5 px-1.5"
                        >{columns.done.length}</Badge
                    >
                </h2>
            </div>
            <div
                class="flex flex-col gap-3 lg:flex-1 lg:overflow-y-auto lg:min-h-0 lg:pr-2 custom-scrollbar"
            >
                {#each columns.done as task (task.ID)}
                    {@render taskCard(task, "done")}
                {/each}
                {#if columns.done.length === 0}
                    <div
                        class="h-32 rounded-xl border-2 border-dashed flex items-center justify-center text-muted-foreground/50 text-xs italic bg-muted/5 shrink-0"
                    >
                        No completed tasks
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

{#snippet taskCard(task: Task, colType: string)}
    <Card.Root
        class="group transition-all hover:shadow-md relative overflow-hidden {colType ===
        'ongoing'
            ? 'bg-blue-500/5 border-blue-500/30 shadow-sm'
            : colType === 'done'
              ? 'opacity-60 bg-muted/20'
              : 'bg-card hover:border-primary/50'}"
    >
        {#if colType === "ongoing"}<div
                class="absolute inset-y-0 left-0 w-1 bg-blue-500"
            ></div>{/if}

        <Card.Content class="p-3 md:p-4 flex flex-col gap-3">
            <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <h3
                            class="text-sm font-bold truncate {task.status ===
                            'done'
                                ? 'line-through text-muted-foreground'
                                : ''}"
                        >
                            {task.title}
                        </h3>
                    </div>
                    {#if task.short_desc}
                        <p
                            class="text-[10px] text-muted-foreground line-clamp-2 mb-2"
                        >
                            {task.short_desc}
                        </p>
                    {/if}
                </div>

                <div class="flex items-center">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            {#snippet child({ props })}
                                <Button
                                    {...props}
                                    variant="ghost"
                                    size="icon"
                                    class="h-6 w-6 ml-1"
                                >
                                    <MoreVertical class="h-3 w-3" />
                                </Button>
                            {/snippet}
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end">
                            <DropdownMenu.Item onclick={() => openDetail(task)}
                                ><Eye class="mr-2 h-4 w-4" /> View</DropdownMenu.Item
                            >
                            <DropdownMenu.Item
                                onclick={() => openEditDialog(task)}
                                ><Edit class="mr-2 h-4 w-4" /> Edit</DropdownMenu.Item
                            >

                            <!-- Context Aware Status Actions -->
                            {#if task.status === "todo"}
                                <DropdownMenu.Item
                                    onclick={() =>
                                        updateStatus(task, "ongoing")}
                                >
                                    <Clock class="mr-2 h-4 w-4" /> Start Task
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() => updateStatus(task, "done")}
                                >
                                    <Check class="mr-2 h-4 w-4" /> Mark Done
                                </DropdownMenu.Item>
                            {:else if task.status === "ongoing"}
                                <DropdownMenu.Item
                                    onclick={() => updateStatus(task, "todo")}
                                >
                                    <X class="mr-2 h-4 w-4" /> Pause (Todo)
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() => updateStatus(task, "done")}
                                >
                                    <Check class="mr-2 h-4 w-4" /> Mark Done
                                </DropdownMenu.Item>
                            {:else}
                                <DropdownMenu.Item
                                    onclick={() => updateStatus(task, "todo")}
                                >
                                    <X class="mr-2 h-4 w-4" /> Reopen (Todo)
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() =>
                                        updateStatus(task, "ongoing")}
                                >
                                    <Clock class="mr-2 h-4 w-4" /> Move to Ongoing
                                </DropdownMenu.Item>
                            {/if}

                            <DropdownMenu.Separator />
                            <DropdownMenu.Item
                                class="text-destructive"
                                onclick={() => confirmDelete(task.ID)}
                                ><Trash2 class="mr-2 h-4 w-4" /> Delete</DropdownMenu.Item
                            >
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    {#if task.tags && task.tags.length > 0}
                        <div class="flex flex-wrap gap-1">
                            {#each task.tags.slice(0, 2) as t}
                                <Badge
                                    variant="secondary"
                                    class="text-[8px] px-1 h-4 font-bold uppercase"
                                    >{t}</Badge
                                >
                            {/each}
                        </div>
                    {/if}
                    {#if isOverdue(task)}
                        <Badge
                            variant="destructive"
                            class="text-[8px] h-4 px-1 animate-pulse"
                            >LATE</Badge
                        >
                    {/if}
                </div>

                <div class="flex items-center gap-2">
                    {#if task.due_date}
                        <div
                            class="flex items-center gap-1 text-[10px] {isOverdue(
                                task,
                            )
                                ? 'text-destructive font-bold'
                                : 'text-muted-foreground'}"
                        >
                            <Clock class="h-3 w-3" />
                            {new Date(task.due_date).toLocaleDateString(
                                "en-US",
                                { day: "numeric", month: "short" },
                            )}
                        </div>
                    {/if}
                    <Badge
                        variant="outline"
                        class="text-[8px] px-1 h-4 font-bold uppercase {priorityColor(
                            task.priority,
                        )}">{task.priority}</Badge
                    >
                </div>
            </div>
        </Card.Content>
    </Card.Root>
{/snippet}

<!-- Dialogs are outside -->
<Dialog.Root bind:open={isAddDialogOpen}>
    <Dialog.Content class="sm:max-w-[550px] bg-background">
        <form onsubmit={handleSaveTask}>
            <Dialog.Header>
                <Dialog.Title
                    >{isEditMode ? "Edit Task" : "New Task"}</Dialog.Title
                >
            </Dialog.Header>
            <div class="grid gap-4 py-4">
                <div class="grid gap-2">
                    <Label>Title</Label>
                    <Input
                        bind:value={newTask.text}
                        placeholder="Task title..."
                        required
                        class="font-bold"
                    />
                </div>
                <div class="grid gap-2">
                    <Label>Short Description</Label>
                    <Input
                        bind:value={newTask.desc}
                        placeholder="Brief summary..."
                    />
                </div>
                <div class="grid gap-2">
                    <Label>Labels</Label>
                    <div
                        class="flex flex-wrap gap-2 p-2 border rounded-md min-h-10 items-center"
                    >
                        {#each newTask.tags as t}
                            <Badge variant="secondary"
                                >{t}
                                <button
                                    type="button"
                                    onclick={() => toggleTag(t)}
                                    class="ml-1"><X class="h-3 w-3" /></button
                                ></Badge
                            >
                        {/each}
                        <input
                            placeholder="+ Tag"
                            class="bg-transparent outline-none text-xs min-w-[60px]"
                            bind:value={tagInput}
                            onkeydown={addCustomTag}
                        />
                    </div>
                    <div class="flex flex-wrap gap-1">
                        {#each categories as cat}
                            <button
                                type="button"
                                onclick={() => toggleTag(cat.name)}
                                class="text-[10px] px-2 py-1 border rounded-full hover:bg-muted {newTask.tags.includes(
                                    cat.name,
                                )
                                    ? 'bg-primary text-primary-foreground'
                                    : ''}">{cat.name}</button
                            >
                        {/each}
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="grid gap-2">
                        <Label>Due Date</Label>
                        <Input
                            type="datetime-local"
                            bind:value={newTask.due_date}
                            class="custom-time-input"
                        />
                    </div>
                    <div class="grid gap-2">
                        <Label>Priority</Label>
                        <Select.Root
                            type="single"
                            bind:value={newTask.priority}
                        >
                            <Select.Trigger>{newTask.priority}</Select.Trigger>
                            <Select.Content>
                                <Select.Item value="High">High</Select.Item>
                                <Select.Item value="Medium">Medium</Select.Item>
                                <Select.Item value="Low">Low</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>
                <div class="grid gap-2">
                    <Label>Detailed Description</Label>
                    <Textarea
                        bind:value={newTask.longDesc}
                        rows={4}
                        class="resize-none"
                    />
                </div>
            </div>
            <Dialog.Footer>
                <Button
                    variant="outline"
                    type="button"
                    onclick={() => (isAddDialogOpen = false)}>Cancel</Button
                >
                <Button type="submit" disabled={isSubmitting}>
                    {#if isSubmitting}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Saving..."}
                    {:else}
                        {isEditMode ? "Update" : "Create"}
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
                                  ).toLocaleDateString()
                                : "No Date"}</span
                        >
                        <span class="flex items-center gap-1.5"
                            ><Clock class="h-4 w-4 text-primary" />
                            {selectedTask.due_date
                                ? new Date(
                                      selectedTask.due_date,
                                  ).toLocaleTimeString([], {
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
                            onclick={() => updateStatus(selectedTask!, "todo")}
                            >Todo</Button
                        >
                        <Button
                            variant={selectedTask.status === "ongoing"
                                ? "default"
                                : "outline"}
                            size="sm"
                            class={selectedTask.status === "ongoing"
                                ? "bg-blue-600"
                                : ""}
                            onclick={() =>
                                updateStatus(selectedTask!, "ongoing")}
                            >Ongoing</Button
                        >
                        <Button
                            variant={selectedTask.status === "done"
                                ? "default"
                                : "outline"}
                            size="sm"
                            class={selectedTask.status === "done"
                                ? "bg-green-600"
                                : ""}
                            onclick={() => updateStatus(selectedTask!, "done")}
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
            </div>
            <div class="p-6 border-t flex gap-3 bg-muted/5">
                <Button
                    variant="outline"
                    class="flex-1"
                    onclick={() => (isDetailOpen = false)}>Close</Button
                >
                <Button
                    class="flex-1 font-bold shadow-md"
                    onclick={() => openEditDialog(selectedTask!)}
                    ><Edit class="mr-2 h-4 w-4" /> Edit Task</Button
                >
            </div>
        {/if}
    </Sheet.Content>
</Sheet.Root>

<!-- Alert Dialog for Delete Confirmation -->
<AlertDialog.Root bind:open={isDeleteDialogOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
            <AlertDialog.Description>
                This action cannot be undone. This will permanently delete the
                task.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel onclick={() => (isDeleteDialogOpen = false)}
                >Cancel</AlertDialog.Cancel
            >
            <AlertDialog.Action
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onclick={proceedDelete}>Delete</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<style>
    :global(.custom-time-input::-webkit-calendar-picker-indicator) {
        background: none;
        display: none;
    }
</style>
