const inputBox = document.getElementById("input-box"); //to take ellement form the html file we use the getElement
const listContainer = document.getElementById("list-container");//return all the html element with the same id as the one put in ()
const deleteDialog = document.getElementById("delete-dialog");
const editDialog = document.getElementById("edit-dialog");
const cancelDeleteButton = document.getElementById("cancel-delete");
const confirmDeleteButton = document.getElementById("confirm-delete");
const editTaskInput = document.getElementById("edit-task-input");
const editTaskError = document.getElementById("edit-task-error");
const cancelEditButton = document.getElementById("cancel-edit");
const saveEditButton = document.getElementById("save-edit");
const storageKey = "todo-tasks";  // creating a constant to save the tasks in the local storage , we write it in a constant to not have to write todo-tasks eeach time
let nextTaskOrder = 0; // for the order of the task 
//putting let here because it 's value will change unlike const
let nextPinOrder = 0;
let pendingDeleteItem = null;
let pendingEditItem = null;

function addTask() {
    const text = inputBox.value.trim();  // the trim() remove sppace at the beginning and the end to only have the text 
    if (!text) {   // if text empty then create an alert to nootify the user that he need to wirte someting
        alert("You must write something!");
        return;  // to stop the operation and not just append to the list, to leave addTask()
    }

    appendTask({ 
                text,    // text : text
                checked: false,  // the new task is unchecked
                pinned: false, // the new tast is not pinned
                order: nextTaskOrder++ });  //we give a number o the task starting from 0
    inputBox.value = "";  // after adding the value of the input we empty it then ssave it in the localStorage
    saveData();
}

function appendTask(task) {   // to create the task in the html body
    const listItem = document.createElement("li"); // to create dynamically the element without writing them in the html file
    const order = Number.isInteger(task.order) ? task.order : nextTaskOrder; // ternary condition
    const pinned = Boolean(task.pinned); // for the pin if true it pin if false it doesn't
    const pinOrder = Number.isInteger(task.pinOrder) ? task.pinOrder : (pinned ? nextPinOrder : -1);
    
    listItem.dataset.order = String(order);// we use string because the dataset is stock as a character chaine
    listItem.dataset.pinned = String(pinned);
    listItem.dataset.pinOrder = String(pinOrder);
    nextTaskOrder = Math.max(nextTaskOrder, order + 1);
    if (pinned) nextPinOrder = Math.max(nextPinOrder, pinOrder + 1);
    listItem.classList.toggle("checked", task.checked);

    const taskText = document.createElement("span");  // we are putting now text not in the html file but throught the website directly
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task";
    deleteButton.setAttribute("aria-label", "Delete task");
    deleteButton.textContent = "×";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-task";
    editButton.setAttribute("aria-label", "Edit task");
    editButton.title = "Edit task";
    editButton.textContent = "✎";

    const pinButton = document.createElement("button");
    pinButton.type = "button";
    pinButton.className = "pin-task";
    const pinIcon = document.createElement("img");
    pinIcon.src = "images/star.png";
    pinIcon.alt = "";
    pinIcon.setAttribute("aria-hidden", "true");
    pinButton.appendChild(pinIcon);
    updatePinButton(pinButton, pinned);

    listItem.append(taskText, pinButton, editButton, deleteButton);   // to add all the ellement in the row so we have the TEXT , STAR(PIN), EDIT, DELETE
    listContainer.appendChild(listItem); // to add it to the DOM
}

function updatePinButton(pinButton, pinned) {  // TO PIN / UNPIN THE ITEM IN THE ROW
    const label = pinned ? "Unpin task" : "Pin task";
    pinButton.classList.toggle("is-pinned", pinned);
    pinButton.setAttribute("aria-label", label);
    pinButton.title = label;
}

function reorderTasks() {
    const tasks = Array.from(listContainer.querySelectorAll("li"));   // to transform all the element into real JAVASCRIPT table
    tasks.sort((firstTask, secondTask) => {  // the function will do a comparaison with the one after to see if it's pinned or no, if it's pinned we put fiirsttask before secondTask so that the pinned task come before the others
        const firstPinned = firstTask.dataset.pinned === "true";
        const secondPinned = secondTask.dataset.pinned === "true";
        if (firstPinned !== secondPinned) return firstPinned ? -1 : 1;

        if (firstPinned) {  // if both of the task are pin we compare their positioln through number()
            const pinOrder = Number(secondTask.dataset.pinOrder) - Number(firstTask.dataset.pinOrder);
            if (pinOrder !== 0) return pinOrder;
        }
        return Number(firstTask.dataset.order) - Number(secondTask.dataset.order);
    });
    listContainer.replaceChildren(...tasks);
}

function saveData() {   // saving the data in the local storage
    const tasks = Array.from(listContainer.querySelectorAll("li"), (listItem) => ({  // to take all the li and transform it into object to be saved
        text: listItem.querySelector(".task-text").textContent,
        checked: listItem.classList.contains("checked"),
        pinned: listItem.dataset.pinned === "true",
        order: Number(listItem.dataset.order),
        pinOrder: Number(listItem.dataset.pinOrder)
    }));
    localStorage.setItem(storageKey, JSON.stringify(tasks));   //through this command the tasks are actually saved
}

function loadData() {  //saving the data so that when i load the page it still apppear , it doesn't dsappear from the page
    try {
        const tasks = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (Array.isArray(tasks)) {
            tasks.forEach((task, index) => {
                if (task && typeof task.text === "string") {
                    appendTask({
                        text: task.text,
                        checked: Boolean(task.checked),
                        pinned: Boolean(task.pinned),
                        order: Number.isInteger(task.order) ? task.order : index,
                        pinOrder: task.pinOrder
                    });
                }
            });
            reorderTasks();
        }
    } catch {
        localStorage.removeItem(storageKey);
    }
}

function saveEditedTask() {
    const text = editTaskInput.value.trim();
    if (!text) {
        editTaskError.textContent = "Task name cannot be empty.";
        editTaskInput.focus();
        return;
    }

    if (pendingEditItem) {
        pendingEditItem.querySelector(".task-text").textContent = text;
        saveData();
    }
    editDialog.close();
}

listContainer.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const listItem = event.target.closest("li");
    if (!listItem || listItem.dataset.deleting === "true") return;

    const pinButton = event.target.closest(".pin-task");
    if (pinButton) {
        const pinned = listItem.dataset.pinned !== "true";
        listItem.dataset.pinned = String(pinned);
        if (pinned) listItem.dataset.pinOrder = String(nextPinOrder++);
        updatePinButton(pinButton, pinned);
        reorderTasks();
        saveData();
        return;
    }

    const editButton = event.target.closest(".edit-task");
    if (editButton) {
        pendingEditItem = listItem;
        editTaskInput.value = listItem.querySelector(".task-text").textContent;
        editTaskError.textContent = "";
        editDialog.showModal();
        editTaskInput.focus();
        editTaskInput.select();
        return;
    }

    const deleteButton = event.target.closest(".delete-task");
    if (deleteButton) {
        pendingDeleteItem = listItem;
        deleteDialog.showModal();
        return;
    }

    listItem.classList.toggle("checked");
    saveData();
});

cancelDeleteButton.addEventListener("click", () => deleteDialog.close());
cancelEditButton.addEventListener("click", () => editDialog.close());

confirmDeleteButton.addEventListener("click", () => {
    if (pendingDeleteItem) {
        pendingDeleteItem.remove();
        saveData();
    }
    pendingDeleteItem = null;
    deleteDialog.close();
});

deleteDialog.addEventListener("close", () => {
    pendingDeleteItem = null;
});

deleteDialog.addEventListener("click", (event) => {
    if (event.target === deleteDialog) deleteDialog.close();
});

saveEditButton.addEventListener("click", saveEditedTask);
editTaskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveEditedTask();
});

editDialog.addEventListener("close", () => {
    pendingEditItem = null;
    editTaskError.textContent = "";
});

editDialog.addEventListener("click", (event) => {
    if (event.target === editDialog) editDialog.close();
});

inputBox.addEventListener("keydown", (event) => {  // so that if we put enter it will add the task in the list withoutt clicking on add
    if (event.key === "Enter") addTask();
});

loadData();