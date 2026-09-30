const inputBox =document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

let tasks = []; // the list of all the tasks, the page is drawn from this list

function addTask(){
    let text = inputBox.value.trim(); // trim() removes the spaces at the start and the end
    if (text ===''){
        alert("You must write something!!"); // alert stop all process and make the text appear 
        inputBox.focus();
        return;
    }
    tasks.push({id: createTaskId(), text: text, checked: false, pinned: false}); // we add the task in the list
    inputBox.value = "";
    save();
    renderTasks();
}

function createTaskId(){
    let id = Date.now();
    while (tasks.some(function(task){
        return task.id === id;
    })){
        id++;
    }
    return id;
}

// to create one task on the page
function createLi(task){
    let li =document.createElement("li");
    li.textContent = task.text;
    li.dataset.id = task.id; // we keep the task's unique id in the list
    if (task.checked){
        li.classList.add("checked");
    }
    if (task.pinned){
        li.classList.add("pinned");
    }
    addIcon(li, "\u2605", "pin");    // the star to pin
    addIcon(li, "\u270E", "edit");   // the pencil to edit
    addIcon(li, "\u00d7", "delete"); // the x sign to delete
    listContainer.appendChild(li);
}

// to put an icon in the same line we use span
function addIcon(li, symbol, className){
    let span =document.createElement("span");
    span.textContent = symbol;
    span.className = className;
    li.appendChild(span);
}

// to show all the tasks of the list on the page
function renderTasks(){
    listContainer.innerHTML = ""; // we empty the page first so nothing is shown twice
    for (let i = 0; i < tasks.length; i++){   // first the pinned tasks
        if (tasks[i].pinned){
            createLi(tasks[i]);
        }
    }
    for (let i = 0; i < tasks.length; i++){   // then the other tasks
        if (!tasks[i].pinned){
            createLi(tasks[i]);
        }
    }
}

listContainer.addEventListener("click",function(e){
    let changed = false;
    if(e.target.tagName === "LI"){ // if i click on the text it will check it
        changed = toggleTask(e.target.dataset.id);
    }
    else if (e.target.className === "delete"){ // if i click on the x sign it will delete it
        changed = deleteTask(e.target.parentElement.dataset.id);
    }
    else if (e.target.className === "edit"){ // if i click on the pencil it will edit it
        changed = editTask(e.target.parentElement.dataset.id);
    }
    else if (e.target.className === "pin"){ // if i click on the star it will pin / unpin it
        changed = pinTask(e.target.parentElement.dataset.id);
    }
    if (changed){
        save();
        renderTasks();
    }
},false);

function findTaskIndex(id){
    return tasks.findIndex(function(task){
        return task.id === Number(id);
    });
}

function toggleTask(id){
    let index = findTaskIndex(id);
    if (index === -1){
        return false;
    }
    tasks[index].checked = !tasks[index].checked; // true becomes false and false becomes true
    return true;
}

function deleteTask(id){
    let index = findTaskIndex(id);
    if (index === -1){
        return false;
    }
    if (confirm("Are you sure you want to delete this task?")){
        // filter keeps all the tasks except the one we want to delete
        tasks = tasks.filter(function(task){
            return task.id !== Number(id);
        });
        return true;
    }
    return false;
}

function editTask(id){
    let index = findTaskIndex(id);
    if (index === -1){
        return false;
    }
    let newText = prompt("Edit your task:", tasks[index].text);
    if (newText === null){ // the user clicked cancel
        return false;
    }
    if (newText.trim() === ""){
        alert("Task name cannot be empty.");
        return false;
    }
    if (newText.trim() === tasks[index].text){
        return false;
    }
    tasks[index].text = newText.trim();
    return true;
}

function pinTask(id){
    let index = findTaskIndex(id);
    if (index === -1){
        return false;
    }
    if (tasks[index].pinned && !confirm("Are you sure you want to unpin this task?")){
        return false;
    }
    tasks[index].pinned = !tasks[index].pinned; // pin if it's not pinned, unpin if it's pinned
    return true;
}

inputBox.addEventListener("keydown",function(e){
    if (e.key === "Enter"){ // pressing enter adds the task without clicking on add
        addTask();
    }
});

function save() {
    localStorage.setItem('tasks', JSON.stringify(tasks)); // JSON.stringify transforms the list into text to save it
 }

function load() {
    try {
        let data = localStorage.getItem("tasks");
        if (data){  // to protect agianst a corrumpt local storage
            let savedTasks = JSON.parse(data);
            if (Array.isArray(savedTasks)){
                let usedIds = new Set();
                let nextId = Date.now();
                tasks = savedTasks
                    .filter(function(task){
                        return task && typeof task.text === "string";
                    })
                    .map(function(task){
                        let id = Number.isSafeInteger(task.id) ? task.id : nextId;
                        while (usedIds.has(id)){
                            id = nextId++;
                        }
                        usedIds.add(id);
                        nextId = Math.max(nextId, id + 1);
                        return {
                            id: id,
                            text: task.text,
                            checked: task.checked === true,
                            pinned: task.pinned === true
                        };
                    });
            }
        }
    } catch (error) {
        tasks = [];
    }
    renderTasks();
}

load();