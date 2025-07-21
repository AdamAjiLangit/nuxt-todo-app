<template>
    <v-app :theme="darkMode ? 'dark' : 'light'">
        <v-container class="pb-16 pt-16" max-width="700">
            <v-card elevation="4" rounded="lg" class="pa-2">
                <v-card-title class="d-flex justify-space-between align-center">
                    <div class="text-h6 font-weight-bold">📝 Todo List</div>
                    <v-btn icon variant="text" class="float-right" @click="darkMode = !darkMode">
                        <v-icon>{{ darkMode ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-subtitle class="text-grey-darken-1">
                    Organize your tasks easily.
                </v-card-subtitle>

                <!-- Filter Buttons -->
                <div class="d-flex justify-center my-4">
                    <v-btn v-for="f in filters" :key="f" class="mx-1" :color="filter === f ? 'primary' : ''"
                        variant="outlined" size="small" @click="filter = f">
                        {{ f }}
                    </v-btn>
                </div>

                <v-card-text>
                    <v-row class="mb-4" dense>
                        <v-col cols="8">
                            <v-text-field v-model="newTodo" placeholder="New task..." density="compact"
                                variant="outlined" hide-details />
                        </v-col>
                        <v-col cols="4">
                            <v-btn :disabled="!newTodo" color="primary" block @click="addTodo">
                                {{ isEditing ? 'Save' : 'Add' }}
                            </v-btn>
                        </v-col>
                    </v-row>

                    <v-divider></v-divider>

                    <div v-if="pending" class="text-center text-grey my-6">
                        Loading tasks...
                    </div>

                    <div v-else-if="filteredTodos.length === 0" class="text-center text-grey my-6">
                        🎉 Nothing to do! Add something above.
                    </div>

                    <v-list v-else lines="two">
                        <v-slide-y-transition group>
                            <v-list-item v-for="todo in filteredTodos" :key="todo.id" class="rounded-lg">
                                <template #prepend>
                                    <v-btn icon variant="text" size="small" :color="todo.completed ? 'green' : 'grey'"
                                        @click="toggleDone(todo)">
                                        <v-icon>
                                            {{
                                                todo.completed
                                                    ? 'mdi-checkbox-marked'
                                                    : 'mdi-checkbox-blank-outline'
                                            }}
                                        </v-icon>
                                    </v-btn>
                                </template>

                                <v-list-item-title
                                    :class="{ 'text-decoration-line-through text-grey': todo.completed }">
                                    {{ todo.title }}
                                </v-list-item-title>

                                <template #append>
                                    <v-btn icon variant="text" @click="startEdit(todo)">
                                        <v-icon>mdi-pencil</v-icon>
                                    </v-btn>
                                    <v-btn icon color="red" variant="text" @click="openDeleteDialog(todo)">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </template>
                            </v-list-item>
                        </v-slide-y-transition>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-container>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="showDeleteDialog" width="300">
            <v-card class="rounded-lg pa-2">
                <v-card-title>Delete Task?</v-card-title>
                <v-card-text>Are you sure you want to delete "{{ taskToDelete?.title }}"?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
                    <v-btn color="red" variant="tonal" @click="confirmDelete">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar.show" :timeout="2000" location="top center">
            {{ snackbar.message }}
        </v-snackbar>
    </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';

const todos = ref<any[]>([]);
const newTodo = ref('');
const isEditing = ref(false);
const editTaskId = ref<number | null>(null);
const darkMode = ref(false);

const filters = ['All', 'Pending', 'Done'];
const filter = ref('All');

const { data, pending } = useFetch('/todos?_limit=10', {
    baseURL: 'https://jsonplaceholder.typicode.com',
});
watchEffect(() => {
    if (data.value) {
        todos.value = data.value;
    }
});

const snackbar = ref({ show: false, message: '' });
const showSnackbar = (msg: string) => {
    snackbar.value.message = msg;
    snackbar.value.show = true;
};

const showDeleteDialog = ref(false);
const taskToDelete = ref<any>(null);
const openDeleteDialog = (todo: any) => {
    taskToDelete.value = todo;
    showDeleteDialog.value = true;
};
const confirmDelete = async () => {
    const id = taskToDelete.value.id;
    await $fetch(`/todos/${id}`, {
        baseURL: 'https://jsonplaceholder.typicode.com',
        method: 'DELETE',
    });
    todos.value = todos.value.filter((todo) => todo.id !== id);
    showDeleteDialog.value = false;
    showSnackbar('Task deleted!');
};

const addTodo = async () => {
    if (!newTodo.value) return;

    if (isEditing.value && editTaskId.value !== null) {
        const task = todos.value.find((t) => t.id === editTaskId.value);
        if (task) {
            task.title = newTodo.value;
            showSnackbar('Task updated!');
        }
        isEditing.value = false;
        editTaskId.value = null;
    } else {
        const newItem = await $fetch('/todos', {
            baseURL: 'https://jsonplaceholder.typicode.com',
            method: 'POST',
            body: { title: newTodo.value, completed: false },
        });
        todos.value.unshift(newItem);
        showSnackbar('Task added!');
    }

    newTodo.value = '';
};

const startEdit = (todo: any) => {
    newTodo.value = todo.title;
    isEditing.value = true;
    editTaskId.value = todo.id;
};

const toggleDone = (todo: any) => {
    todo.completed = !todo.completed;
    showSnackbar(todo.completed ? 'Task marked as done!' : 'Task marked as pending!');
};

// Filtered Tasks Computed Property
const filteredTodos = computed(() => {
    if (filter.value === 'Pending') {
        return todos.value.filter((todo) => !todo.completed);
    } else if (filter.value === 'Done') {
        return todos.value.filter((todo) => todo.completed);
    }
    return todos.value;
});
</script>
