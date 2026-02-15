<script lang="ts">
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Badge } from "$lib/components/ui/badge";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as Sheet from "$lib/components/ui/sheet";
    import * as Pagination from "$lib/components/ui/pagination";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Select from "$lib/components/ui/select";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Separator } from "$lib/components/ui/separator";
    import { Calendar } from "$lib/components/ui/calendar";
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
        Search,
        Trash2,
        Eye,
        Save,
        X,
        Hash,
        Filter,
        ListFilter,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";

    // --- 1. DATA & STATE ---
    let tasks = $state([
        {
            id: 1,
            text: "Setup Project SvelteKit",
            desc: "Initialize bun and git",
            done: true,
            tags: ["Dev", "Urgent"],
            priority: "High",
            due_date: "2026-02-14T09:00:00.000Z",
            longDesc: "Install SvelteKit using Bun and setup Tailwind v4.",
        },
        {
            id: 2,
            text: "Integrate Shadcn UI",
            desc: "Install themes and components",
            done: true,
            tags: ["UI"],
            priority: "Medium",
            due_date: "2026-02-14T11:00:00.000Z",
            longDesc: "Add components and themes.",
        },
        // ... (truncated dummy data would go here, effectively omitted for brevity as I'm replacing the block)
    ]);

    let categories = $state([
        { name: "Dev", color: "bg-blue-500" },
        { name: "UI", color: "bg-pink-500" },
        { name: "Backend", color: "bg-orange-500" },
        { name: "Urgent", color: "bg-red-500" },
        { name: "Database", color: "bg-emerald-500" },
    ]);

    // Filter States
    let searchQuery = $state("");
    let statusFilter = $state("all"); // all, pending, done
    let priorityFilter = $state("all"); // all, High, Medium, Low

    // CRUD States (Sama seperti Dashboard)
    let newTask = $state({
        text: "",
        desc: "",
        longDesc: "",
        priority: "Medium",
        due_date: "",
        tags: [] as string[],
    });
    let tagInput = $state("");
    let selectedIds = $state<number[]>([]);
    let selectedTask = $state<any>(null);
    let isDetailOpen = $state(false);
    let isAddDialogOpen = $state(false);
    let isEditMode = $state(false);
    let editingTaskId = $state<number | null>(null);

    // --- 2. LOGIC ---
    // Filtering Logic
    const filteredTasks = $derived(
        tasks.filter((t) => {
            const matchesSearch =
                t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.desc &&
                    t.desc.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus =
                statusFilter === "all"
                    ? true
                    : statusFilter === "done"
                      ? t.done
                      : !t.done;
            const matchesPriority =
                priorityFilter === "all" ? true : t.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        }),
    );

    // Pagination Logic (Based on Filtered Results)
    let currentPage = $state(1);
    let perPage = 8; // Tampilkan lebih banyak karena full width
    const count = $derived(filteredTasks.length);
    const paginatedTasks = $derived(
        filteredTasks.slice((currentPage - 1) * perPage, currentPage * perPage),
    );

    // --- 3. HANDLERS (Reused) ---
    function openDetail(task: any) {
        selectedTask = task;
        isDetailOpen = true;
    }
    function deleteTask(id: number) {
        tasks = tasks.filter((t) => t.id !== id);
        toast.error("Task deleted");
    }
    function toggleDone(task: any) {
        const index = tasks.findIndex((t) => t.id === task.id);
        if (index !== -1) {
            tasks[index].done = !tasks[index].done;
            toast.success(
                tasks[index].done
                    ? "Task marked as done"
                    : "Task marked as undone",
            );
        }
    }
    function bulkMarkDone() {
        tasks = tasks.map((t) => {
            if (selectedIds.includes(t.id)) {
                return { ...t, done: true };
            }
            return t;
        });
        selectedIds = [];
        toast.success("Selected tasks marked as done");
    }
    function toggleTag(tagName: string) {
        if (newTask.tags.includes(tagName))
            newTask.tags = newTask.tags.filter((t) => t !== tagName);
        else newTask.tags.push(tagName);
    }
    function addCustomTag(e: KeyboardEvent) {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!newTask.tags.includes(tagInput.trim()))
                newTask.tags.push(tagInput.trim());
            tagInput = "";
        }
    }

    function openEditDialog(task: any) {
        isEditMode = true;
        editingTaskId = task.id;
        newTask = {
            text: task.text,
            desc: task.desc || "",
            longDesc: task.longDesc || "",
            priority: task.priority,
            due_date: task.due_date
                ? new Date(
                      new Date(task.due_date).getTime() -
                          new Date(task.due_date).getTimezoneOffset() * 60000,
                  )
                      .toISOString()
                      .slice(0, 16)
                : "",
            tags: [...task.tags],
        };
        isAddDialogOpen = true;
        isDetailOpen = false;
    }

    function handleSaveTask(e: Event) {
        e.preventDefault();
        if (isEditMode && editingTaskId) {
            const index = tasks.findIndex((t) => t.id === editingTaskId);
            if (index !== -1) {
                tasks[index] = { ...tasks[index], ...newTask };
                toast.success("Saved changes");
            }
        } else {
            tasks.push({ id: Date.now(), ...newTask, done: false });
            toast.success("Task added to list");
        }
        isAddDialogOpen = false;
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
                    {#if page.type === "ellipsis"}<Pagination.Item
                            ><Pagination.Ellipsis /></Pagination.Item
                        >
                    {:else}<Pagination.Item
                            ><Pagination.Link
                                {page}
                                isActive={currentPage === page.value}
                                >{page.value}</Pagination.Link
                            ></Pagination.Item
                        >{/if}
                {/each}
                <Pagination.Item><Pagination.Next /></Pagination.Item>
            </Pagination.Content>
        {/snippet}
    </Pagination.Root>
{/snippet}

<div class="w-full pb-32 px-2 md:px-6 bg-background min-h-screen">
    <div class="flex items-center justify-between gap-4 mb-8">
        <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
                All Tasks
            </h1>
            <p class="text-muted-foreground text-[10px] md:text-sm font-medium">
                Manage and filter your complete task history.
            </p>
        </div>
        <Button
            size="sm"
            onclick={() => {
                isEditMode = false;
                isAddDialogOpen = true;
            }}
        >
            <Plus class="mr-1 h-4 w-4" />
            <span class="hidden md:inline">Create Task</span><span
                class="md:hidden text-xs">Add</span
            >
        </Button>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="relative flex-1">
            <Search
                class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            />
            <Input
                placeholder="Search tasks by title or description..."
                class="pl-9 bg-card"
                bind:value={searchQuery}
            />
        </div>
        <div class="flex gap-2 shrink-0">
            <div class="w-[130px]">
                <Select.Root type="single" bind:value={statusFilter}>
                    <Select.Trigger class="bg-card">
                        {statusFilter === "all"
                            ? "All Status"
                            : statusFilter === "done"
                              ? "Completed"
                              : "Pending"}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="all">All Status</Select.Item>
                        <Select.Item value="pending">Pending</Select.Item>
                        <Select.Item value="done">Completed</Select.Item>
                    </Select.Content>
                </Select.Root>
            </div>
            <div class="w-[130px]">
                <Select.Root type="single" bind:value={priorityFilter}>
                    <Select.Trigger class="bg-card">
                        {priorityFilter === "all"
                            ? "All Priority"
                            : priorityFilter}
                    </Select.Trigger>
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

    <div class="flex flex-col min-h-[500px]">
        {#if paginatedTasks.length > 0}
            <div class="flex flex-col gap-3 flex-1">
                {#each paginatedTasks as task (task.id)}
                    <Card.Root
                        class="group transition-all {task.done
                            ? 'bg-muted/40 opacity-70'
                            : 'bg-card hover:border-primary/50'}"
                    >
                        <Card.Content class="p-0 flex items-stretch">
                            <div
                                class="px-3 md:px-4 flex items-center border-r shrink-0"
                            >
                                <Checkbox
                                    checked={selectedIds.includes(task.id)}
                                    onCheckedChange={(v) => {
                                        if (v)
                                            selectedIds = [
                                                ...selectedIds,
                                                task.id,
                                            ];
                                        else
                                            selectedIds = selectedIds.filter(
                                                (id) => id !== task.id,
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
                                    <div class="flex items-center gap-2 mb-1">
                                        <h3
                                            class="text-sm md:text-base font-semibold truncate {task.done
                                                ? 'line-through text-muted-foreground'
                                                : ''}"
                                        >
                                            {task.text}
                                        </h3>
                                        {#each task.tags as t}
                                            <Badge
                                                variant="secondary"
                                                class="text-[8px] px-1.5 h-4 font-bold uppercase"
                                                >{t}</Badge
                                            >
                                        {/each}
                                    </div>
                                    <p
                                        class="text-muted-foreground text-[10px] md:text-xs italic line-clamp-1"
                                    >
                                        "{task.desc}"
                                    </p>
                                </div>
                                <div
                                    class="flex items-center gap-2 md:gap-6 shrink-0 border-l pl-3 md:pl-4"
                                >
                                    <div
                                        class="hidden lg:flex items-center gap-1 text-[10px] text-muted-foreground font-medium mr-4"
                                    >
                                        {#if task.due_date}
                                            <CalendarIcon class="h-3 w-3" />
                                            {new Date(
                                                task.due_date,
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        {/if}
                                    </div>
                                    <div
                                        class="flex flex-col items-center gap-1"
                                    >
                                        <Badge
                                            variant="outline"
                                            class="font-bold text-[8px] md:text-[9px] uppercase {priorityColor(
                                                task.priority,
                                            )}">{task.priority}</Badge
                                        >
                                        <div
                                            class="flex items-center gap-1 text-[9px] md:text-[10px] text-muted-foreground font-bold font-mono"
                                        >
                                            {#if task.due_date}
                                                <Clock class="h-3 w-3" />
                                                {new Date(
                                                    task.due_date,
                                                ).toLocaleTimeString("id-ID", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            {/if}
                                        </div>
                                    </div>
                                    <ChevronRight
                                        class="h-4 w-4 text-muted-foreground hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
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
                                        class="w-40 bg-background"
                                    >
                                        <DropdownMenu.Item
                                            onclick={() => openDetail(task)}
                                            ><Eye class="mr-2 h-4 w-4" /> View Details</DropdownMenu.Item
                                        >
                                        <DropdownMenu.Item
                                            onclick={() => openEditDialog(task)}
                                            ><Edit class="mr-2 h-4 w-4" /> Edit Task</DropdownMenu.Item
                                        >
                                        <DropdownMenu.Item
                                            onclick={() => toggleDone(task)}
                                        >
                                            <Check class="mr-2 h-4 w-4" />
                                            {task.done
                                                ? "Mark as Undone"
                                                : "Mark as Done"}
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Separator />
                                        <DropdownMenu.Item
                                            class="text-destructive font-bold"
                                            onclick={() => deleteTask(task.id)}
                                            ><Trash2 class="mr-2 h-4 w-4" /> Delete
                                            Task</DropdownMenu.Item
                                        >
                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>

            <div class="pt-8 flex justify-center mt-auto">
                {@render paginationControl()}
            </div>
        {:else}
            <div
                class="flex flex-col items-center justify-center h-[400px] text-center border-2 border-dashed rounded-xl bg-muted/10"
            >
                <div class="bg-background p-4 rounded-full mb-4 shadow-sm">
                    <ListFilter class="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 class="font-bold text-lg">No tasks found</h3>
                <p
                    class="text-sm text-muted-foreground max-w-[250px] mt-1 mb-6"
                >
                    Try adjusting your search or filters.
                </p>
                <Button
                    variant="outline"
                    onclick={() => {
                        searchQuery = "";
                        statusFilter = "all";
                        priorityFilter = "all";
                    }}>Clear Filters</Button
                >
            </div>
        {/if}
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
                        ><Input
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
                        ><Input
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
                            {#each newTask.tags as t}<Badge
                                    variant="secondary"
                                    class="gap-1 pl-2 font-bold uppercase text-[10px] animate-in zoom-in-95"
                                    >{t}
                                    <button
                                        type="button"
                                        onclick={() => toggleTag(t)}
                                        class="hover:text-destructive"
                                        ><X class="h-3 w-3" /></button
                                    ></Badge
                                >{:else}<span
                                    class="text-xs text-muted-foreground/50 italic px-1"
                                    >Pick from suggestions...</span
                                >{/each}
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            {#each categories as cat}<button
                                    type="button"
                                    onclick={() => toggleTag(cat.name)}
                                    class="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all {newTask.tags.includes(
                                        cat.name,
                                    )
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'bg-background hover:border-primary text-muted-foreground'}"
                                    >{cat.name}</button
                                >{/each}
                            <div class="flex items-center border-l pl-2 ml-1">
                                <input
                                    placeholder="+ New Label"
                                    class="bg-transparent outline-none text-[10px] w-20 font-medium placeholder:italic"
                                    bind:value={tagInput}
                                    onkeydown={addCustomTag}
                                />
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="grid gap-2">
                            <Label
                                for="due_date"
                                class="text-[10px] uppercase font-black text-muted-foreground"
                                >Due Date & Time</Label
                            >
                            <div class="relative">
                                <Input
                                    id="due_date"
                                    type="datetime-local"
                                    bind:value={newTask.due_date}
                                    class="bg-muted/10 custom-time-input"
                                />
                                <CalendarIcon
                                    class="absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-50 pointer-events-none"
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
                                    >{newTask.priority}
                                    <ChevronDown
                                        class="ml-2 h-4 w-4 opacity-50"
                                    /></DropdownMenu.Trigger
                                >
                                <DropdownMenu.Content
                                    class="w-[200px] bg-background border shadow-xl"
                                    ><DropdownMenu.RadioGroup
                                        bind:value={newTask.priority}
                                        ><DropdownMenu.RadioItem value="High"
                                            >High</DropdownMenu.RadioItem
                                        ><DropdownMenu.RadioItem value="Medium"
                                            >Medium</DropdownMenu.RadioItem
                                        ><DropdownMenu.RadioItem value="Low"
                                            >Low</DropdownMenu.RadioItem
                                        ></DropdownMenu.RadioGroup
                                    ></DropdownMenu.Content
                                >
                            </DropdownMenu.Root>
                        </div>
                    </div>
                    <div class="grid gap-2">
                        <Label
                            for="longDesc"
                            class="text-[10px] uppercase font-black text-muted-foreground"
                            >Detailed Description</Label
                        ><Textarea
                            id="longDesc"
                            bind:value={newTask.longDesc}
                            rows={4}
                            class="bg-muted/10 resize-none"
                        />
                    </div>
                </div>
            </div>
            <Dialog.Footer class="bg-muted/30 p-6 border-t"
                ><Button
                    type="button"
                    variant="outline"
                    onclick={() => (isAddDialogOpen = false)}>Cancel</Button
                ><Button type="submit" class="font-bold shadow-md"
                    >{isEditMode ? "Update Changes" : "Save Task"}</Button
                ></Dialog.Footer
            >
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
                        >{selectedTask.text}</Sheet.Title
                    >
                    <div
                        class="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase border-y py-4"
                    >
                        <span class="flex items-center gap-1.5"
                            ><CalendarIcon class="h-4 w-4 text-primary" />
                            {selectedTask.due_date
                                ? new Date(
                                      selectedTask.due_date,
                                  ).toLocaleDateString()
                                : "No date"}</span
                        >
                        <span class="flex items-center gap-1.5"
                            ><Clock class="h-4 w-4 text-primary" />
                            {selectedTask.due_date
                                ? new Date(
                                      selectedTask.due_date,
                                  ).toLocaleTimeString("id-ID", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  })
                                : "--:--"}</span
                        >
                    </div>
                </header>
                {#if selectedTask.longDesc}<section class="space-y-4">
                        <div
                            class="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary"
                        >
                            <AlignLeft class="h-4 w-4" /> Context
                        </div>
                        <div
                            class="text-sm leading-relaxed text-muted-foreground bg-muted/20 p-6 rounded-2xl border-2 border-dashed border-muted italic font-medium"
                        >
                            "{selectedTask.longDesc}"
                        </div>
                    </section>{/if}
                <section class="space-y-4">
                    <div
                        class="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary"
                    >
                        <Tag class="h-4 w-4" /> Labels
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each selectedTask.tags as t}<Badge
                                variant="secondary"
                                class="font-bold uppercase text-[10px] border"
                                >{t}</Badge
                            >{:else}<span
                                class="text-xs text-muted-foreground italic"
                                >No labels assigned.</span
                            >{/each}
                    </div>
                </section>
            </div>
            <div class="p-6 border-t flex gap-3 bg-muted/5">
                <Button
                    variant="outline"
                    class="flex-1"
                    onclick={() => (isDetailOpen = false)}>Close</Button
                ><Button
                    class="flex-1 font-bold shadow-md"
                    onclick={() => openEditDialog(selectedTask)}
                    ><Edit class="mr-2 h-4 w-4" /> Edit Task</Button
                >
            </div>
        {/if}
    </Sheet.Content>
</Sheet.Root>

{#if selectedIds.length > 0}
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div
            class="bg-primary text-primary-foreground px-4 md:px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white/10"
        >
            <span class="text-xs md:text-sm font-bold tracking-tight uppercase"
                >{selectedIds.length} Selected</span
            >
            <Separator
                orientation="vertical"
                class="h-4 bg-primary-foreground/30"
            />
            <Button
                variant="secondary"
                size="sm"
                class="h-8 rounded-full font-bold px-4 text-[10px] md:text-xs text-primary bg-white"
                onclick={bulkMarkDone}
            >
                <Check class="mr-2 h-3 w-3" /> Mark Done
            </Button>
            <Button
                variant="destructive"
                size="sm"
                class="h-8 rounded-full font-black px-4 text-[10px] md:text-xs"
                onclick={() => {
                    tasks = tasks.filter((t) => !selectedIds.includes(t.id));
                    selectedIds = [];
                    toast.error("Tasks deleted");
                }}>Delete All</Button
            >
        </div>
    </div>
{/if}

<style>
    :global(.custom-time-input::-webkit-calendar-picker-indicator) {
        background: none;
        display: none;
    }
</style>
