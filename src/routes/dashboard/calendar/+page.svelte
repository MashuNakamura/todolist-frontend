<script lang="ts">
    import {
        Calendar as CalendarIcon,
        Clock,
        CheckCircle2,
        AlertCircle,
        ChevronRight,
        ChevronDown,
        Plus,
        MoreVertical,
        Save,
        X,
        Hash,
        Check,
        Trash2,
        Edit,
    } from "lucide-svelte";
    import { Calendar } from "$lib/components/ui/calendar";
    import * as Card from "$lib/components/ui/card";
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import * as ScrollArea from "$lib/components/ui/scroll-area";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import {
        type DateValue,
        getLocalTimeZone,
        today,
    } from "@internationalized/date";
    import { toast } from "svelte-sonner";

    // --- 1. STATE & DATA ---
    let value = $state<DateValue | undefined>(today(getLocalTimeZone()));

    // Dummy Data dengan field 'date' (YYYY-MM-DD)
    let tasks = $state([
        {
            id: 1,
            text: "Setup Project SvelteKit",
            due_date: "2026-02-12T09:00:00.000Z",
            priority: "High",
            done: true,
            tag: "Dev",
        },
        {
            id: 2,
            text: "Integrate Shadcn UI",
            due_date: "2026-02-12T11:00:00.000Z",
            priority: "Medium",
            done: true,
            tag: "UI",
        },
        {
            id: 3,
            text: "Client Meeting",
            due_date: "2026-02-13T13:00:00.000Z",
            priority: "High",
            done: false,
            tag: "Meeting",
        },
        {
            id: 4,
            text: "Database Backup",
            due_date: "2026-02-14T09:00:00.000Z",
            priority: "Low",
            done: false,
            tag: "DevOps",
        },
        {
            id: 5,
            text: "Fix Auth Bug",
            due_date: "2026-02-12T15:00:00.000Z",
            priority: "High",
            done: false,
            tag: "Bugfix",
        },
    ]);

    let categories = $state(["Dev", "UI", "Backend", "Urgent", "Meeting"]); // Simple list for suggestions

    // State Form Add Task
    let isAddDialogOpen = $state(false);
    let newTask = $state({
        text: "",
        desc: "",
        priority: "Medium",
        due_date: "",
        tags: [] as string[],
    });
    let tagInput = $state("");

    // --- 2. LOGIC ---
    const selectedDateStr = $derived(value ? value.toString() : "");

    const selectedTasks = $derived(
        tasks
            .filter((t) => {
                if (!t.due_date) return false;
                const taskDate = new Date(t.due_date)
                    .toLocaleDateString("sv")
                    .split("T")[0]; // YYYY-MM-DD local
                return taskDate === selectedDateStr;
            })
            .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || "")),
    );

    const formattedDateHeader = $derived(
        value
            ? new Date(value.toString()).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
              })
            : "Select a date",
    );

    // --- 3. HANDLERS ---
    function openAddDialog() {
        // Reset form tapi set tanggal sesuai kalender
        newTask = {
            text: "",
            desc: "",
            priority: "Medium",
            due_date: value ? `${value.toString()}T09:00` : "", // Pre-fill with selected date + 09:00
            tags: [],
        };
        isAddDialogOpen = true;
    }

    function handleAddTask(e: Event) {
        e.preventDefault();
        // Add task with the SELECTED DATE
        tasks.push({
            id: Date.now(),
            text: newTask.text,
            due_date: newTask.due_date
                ? new Date(newTask.due_date).toISOString()
                : new Date().toISOString(),
            priority: newTask.priority,
            done: false,
            tag: newTask.tags[0] || "General", // Ambil tag pertama sbg utama
        });

        isAddDialogOpen = false;
        toast.success(`Task added for ${selectedDateStr}`);
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

    function deleteTask(id: number) {
        tasks = tasks.filter((t) => t.id !== id);
        toast.error("Task deleted from calendar");
    }

    const priorityColor = (p: string) => {
        if (p === "High") return "text-red-500 border-red-500/20 bg-red-500/10";
        if (p === "Medium")
            return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
        return "text-blue-500 border-blue-500/20 bg-blue-500/10";
    };
</script>

<div class="w-full px-2 md:px-6 bg-background min-h-screen">
    <div class="flex items-center justify-between gap-4 mb-8">
        <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
                Calendar
            </h1>
            <p class="text-muted-foreground text-[10px] md:text-sm font-medium">
                Manage your schedule and upcoming deadlines.
            </p>
        </div>
        <Button
            size="sm"
            variant="outline"
            onclick={() => (value = today(getLocalTimeZone()))}
        >
            Today
        </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        <div class="flex flex-col gap-6">
            <Card.Root
                class="border-none shadow-none bg-transparent lg:bg-card lg:border lg:shadow-sm"
            >
                <Card.Content class="p-0 lg:p-4 flex justify-center">
                    <Calendar
                        bind:value
                        type="single"
                        class="rounded-md border shadow-sm bg-card lg:border-none lg:shadow-none w-full max-w-[320px]"
                    />
                </Card.Content>
            </Card.Root>

            <Card.Root class="hidden lg:block">
                <Card.Header class="pb-2"
                    ><Card.Title class="text-sm font-bold"
                        >Monthly Overview</Card.Title
                    ></Card.Header
                >
                <Card.Content class="grid grid-cols-2 gap-4">
                    <div class="p-3 bg-muted/20 rounded-lg">
                        <span class="text-xs text-muted-foreground font-medium"
                            >Total Tasks</span
                        >
                        <p class="text-2xl font-bold mt-1">24</p>
                    </div>
                    <div class="p-3 bg-muted/20 rounded-lg">
                        <span class="text-xs text-muted-foreground font-medium"
                            >Upcoming</span
                        >
                        <p class="text-2xl font-bold mt-1 text-primary">8</p>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>

        <div class="flex flex-col h-full min-h-[500px]">
            <div class="flex items-center justify-between mb-4 px-1">
                <div class="flex items-center gap-3">
                    <div class="h-8 w-1 bg-primary rounded-full"></div>
                    <h2 class="text-xl font-bold tracking-tight">
                        {formattedDateHeader}
                    </h2>
                </div>
                <div class="flex items-center gap-3">
                    <Badge variant="outline" class="font-mono text-xs"
                        >{selectedTasks.length} Events</Badge
                    >
                    <Button
                        size="icon"
                        variant="ghost"
                        class="h-8 w-8"
                        onclick={openAddDialog}><Plus class="h-4 w-4" /></Button
                    >
                </div>
            </div>

            <Card.Root class="flex-1 border-none shadow-none bg-transparent">
                <Card.Content class="p-0">
                    <ScrollArea.Root class="h-[600px] pr-4">
                        {#if selectedTasks.length > 0}
                            <div class="flex flex-col gap-4">
                                {#each selectedTasks as task}
                                    <div
                                        class="group flex gap-4 items-start relative pl-2"
                                    >
                                        <div
                                            class="w-14 shrink-0 text-[11px] font-mono font-bold text-muted-foreground pt-3 text-right"
                                        >
                                            {task.due_date
                                                ? new Date(
                                                      task.due_date,
                                                  ).toLocaleTimeString(
                                                      "id-ID",
                                                      {
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                      },
                                                  )
                                                : "--:--"}
                                        </div>
                                        <div
                                            class="absolute left-[66px] top-0 bottom-0 w-[2px] bg-muted group-last:bottom-auto group-last:h-6"
                                        ></div>
                                        <div
                                            class="absolute left-[62px] top-3.5 h-2.5 w-2.5 rounded-full border-2 border-background {task.done
                                                ? 'bg-primary'
                                                : 'bg-muted-foreground'} z-10"
                                        ></div>

                                        <Card.Root
                                            class="flex-1 mb-2 hover:border-primary/50 transition-colors {task.done
                                                ? 'opacity-60 bg-muted/20'
                                                : 'bg-card'}"
                                        >
                                            <Card.Content
                                                class="p-4 flex items-center justify-between gap-4"
                                            >
                                                <div>
                                                    <div
                                                        class="flex items-center gap-2 mb-1.5"
                                                    >
                                                        <h3
                                                            class="font-bold text-sm {task.done
                                                                ? 'line-through text-muted-foreground'
                                                                : ''}"
                                                        >
                                                            {task.text}
                                                        </h3>
                                                        <Badge
                                                            variant="secondary"
                                                            class="text-[9px] px-1.5 h-4 font-bold uppercase"
                                                            >{task.tag}</Badge
                                                        >
                                                    </div>
                                                    <div
                                                        class="flex items-center gap-3"
                                                    >
                                                        <Badge
                                                            variant="outline"
                                                            class="text-[9px] px-1.5 py-0 font-bold uppercase {priorityColor(
                                                                task.priority,
                                                            )}"
                                                            >{task.priority}</Badge
                                                        >
                                                    </div>
                                                </div>
                                                <DropdownMenu.Root>
                                                    <DropdownMenu.Trigger>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            class="h-8 w-8"
                                                        >
                                                            <MoreVertical
                                                                class="h-4 w-4"
                                                            />
                                                        </Button>
                                                    </DropdownMenu.Trigger>
                                                    <DropdownMenu.Content
                                                        align="end"
                                                    >
                                                        <DropdownMenu.Item
                                                            onclick={() =>
                                                                toggleDone(
                                                                    task,
                                                                )}
                                                        >
                                                            <Check
                                                                class="mr-2 h-4 w-4"
                                                            />
                                                            {task.done
                                                                ? "Mark as Undone"
                                                                : "Mark as Done"}
                                                        </DropdownMenu.Item>
                                                        <DropdownMenu.Separator
                                                        />
                                                        <DropdownMenu.Item
                                                            class="text-destructive"
                                                            onclick={() =>
                                                                deleteTask(
                                                                    task.id,
                                                                )}
                                                        >
                                                            <Trash2
                                                                class="mr-2 h-4 w-4"
                                                            /> Delete
                                                        </DropdownMenu.Item>
                                                    </DropdownMenu.Content>
                                                </DropdownMenu.Root>
                                            </Card.Content>
                                        </Card.Root>
                                    </div>
                                {/each}
                                <button
                                    onclick={openAddDialog}
                                    class="ml-[72px] flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-2 border-t border-dashed mt-2"
                                >
                                    <Plus class="h-4 w-4" /> Add event to this day
                                </button>
                            </div>
                        {:else}
                            <div
                                class="flex flex-col items-center justify-center h-[400px] text-center border-2 border-dashed rounded-xl bg-muted/10"
                            >
                                <div
                                    class="bg-background p-4 rounded-full mb-4 shadow-sm"
                                >
                                    <CalendarIcon
                                        class="h-8 w-8 text-muted-foreground/50"
                                    />
                                </div>
                                <h3 class="font-bold text-lg">
                                    No plans for this day
                                </h3>
                                <p
                                    class="text-sm text-muted-foreground max-w-[250px] mt-1 mb-6"
                                >
                                    You are free! Use this time to relax or add
                                    a new task.
                                </p>
                                <Button onclick={openAddDialog}>
                                    <Plus class="mr-2 h-4 w-4" /> Add Task for {new Date(
                                        selectedDateStr,
                                    ).toLocaleDateString("en-US", {
                                        day: "numeric",
                                        month: "short",
                                    })}
                                </Button>
                            </div>
                        {/if}
                    </ScrollArea.Root>
                </Card.Content>
            </Card.Root>
        </div>
    </div>
</div>

<Dialog.Root bind:open={isAddDialogOpen}>
    <Dialog.Content class="sm:max-w-[500px] bg-background">
        <form onsubmit={handleAddTask}>
            <Dialog.Header>
                <Dialog.Title>Add Event for {formattedDateHeader}</Dialog.Title>
                <Dialog.Description
                    >Create a new task for this specific date.</Dialog.Description
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
                    <Label>Labels</Label>
                    <div
                        class="flex flex-wrap gap-2 p-2 border rounded-md min-h-10"
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
                            bind:value={tagInput}
                            onkeydown={addCustomTag}
                            class="bg-transparent outline-none text-xs min-w-[60px]"
                        />
                    </div>
                    <div class="flex flex-wrap gap-1 mt-1">
                        {#each categories as cat}
                            <button
                                type="button"
                                onclick={() => toggleTag(cat)}
                                class="text-[10px] px-2 py-1 border rounded-full hover:bg-muted"
                                >{cat}</button
                            >
                        {/each}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="grid gap-2">
                        <Label>Time</Label>
                        <div class="relative">
                            <Input
                                type="datetime-local"
                                bind:value={newTask.due_date}
                                class="custom-time-input"
                            />
                            <Clock
                                class="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none"
                            />
                        </div>
                    </div>
                    <div class="grid gap-2">
                        <Label>Priority</Label>
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger
                                class={buttonVariants({ variant: "outline" }) +
                                    " w-full justify-between"}
                            >
                                {newTask.priority}
                                <ChevronDown class="h-4 w-4 opacity-50" />
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content
                                class="w-[200px] bg-background"
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
            </div>
            <Dialog.Footer>
                <Button
                    variant="outline"
                    type="button"
                    onclick={() => (isAddDialogOpen = false)}>Cancel</Button
                >
                <Button type="submit">Create Task</Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>

<style>
    :global(.custom-time-input::-webkit-calendar-picker-indicator) {
        background: none;
        display: none;
    }
</style>
