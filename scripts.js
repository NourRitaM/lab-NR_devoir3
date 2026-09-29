const inputBox =document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

let tasks = []; // the list of all the tasks, the page is drawn from this list

function addTask(){
    let text = inputBox.value.trim(); // trim() removes the spaces at the start and the end
    if (text ===''){
        alert("You must write something!!"); // alert stop all process and make the text appear 
    }
    else{
        tasks.push({text: text, checked: false, pinned: false}); // we add the task in the list
    }
    inputBox.value = "";
    save() ;
    renderTasks();
}

// to create one task on the page
function createLi(task, index){
    let li =document.createElement("li");
    li.textContent = task.text;
    li.dataset.index = index; // we keep the position of the task in the list
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
            createLi(tasks[i], i);
        }
    }
    for (let i = 0; i < tasks.length; i++){   // then the other tasks
        if (!tasks[i].pinned){
            createLi(tasks[i], i);
        }
    }
}

listContainer.addEventListener("click",function(e){
    if(e.target.tagName === "LI"){ // if i click on the text it will check it
        toggleTask(Number(e.target.dataset.index));
    }
    else if (e.target.className === "delete"){ // if i click on the x sign it will delete it
        deleteTask(Number(e.target.parentElement.dataset.index));
    }
    else if (e.target.className === "edit"){ // if i click on the pencil it will edit it
        editTask(Number(e.target.parentElement.dataset.index));
    }
    else if (e.target.className === "pin"){ // if i click on the star it will pin / unpin it
        pinTask(Number(e.target.parentElement.dataset.index));
    }
    save();
    renderTasks();
},false);

function toggleTask(index){
    tasks[index].checked = !tasks[index].checked; // true becomes false and false becomes true
}

function deleteTask(index){
    if (confirm("Are you sure you want to delete this task?")){
        // filter keeps all the tasks except the one we want to delete
        tasks = tasks.filter(function(task, i){
            return i !== index;
        });
    }
}

function editTask(index){
    let newText = prompt("Edit your task:", tasks[index].text);
    if (newText === null){ // the user clicked cancel
        return;
    }
    if (newText.trim() === ""){
        alert("Task name cannot be empty.");
        return;
    }
    tasks[index].text = newText.trim();
}

function pinTask(index){
    tasks[index].pinned = !tasks[index].pinned; // pin if it's not pinned, unpin if it's pinned
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
    let data = localStorage.getItem("tasks");
    if (data){
        tasks = JSON.parse(data); // JSON.parse transforms the text back into a list
    }
    renderTasks();
}

load();