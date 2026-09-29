const inputBox =document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

function addTask(){
    if (inputBox.value ===''){
        alert("You must write something!!"); // alert stop all process and make the text appear 
    }
    else{
        let li =document.createElement("li");
        li.innerHTML =inputBox.value;
        li.dataset.order = Date.now(); // NEW: a number to remember the original position of the task
        listContainer.appendChild(li);

        let pin =document.createElement("span"); // NEW: the star to pin the task
        pin.innerHTML="\u2605";
        pin.className="pin";
        li.appendChild(pin);

        let edit =document.createElement("span"); // NEW: the pencil to edit the task
        edit.innerHTML="\u270E";
        edit.className="edit";
        li.appendChild(edit);

        let span =document.createElement("span");// to put the x sign in the same line we use span
        span.innerHTML="\u00d7"; // to create the X sign for the delete later 
        span.className="delete"; // NEW: a class to know which span is the delete one
        li.appendChild(span);
    }
    inputBox.value = "";
    save() ;
}
listContainer.addEventListener("click",function(e){
    if(e.target.tagName === "LI"){ // if i click on the text it will check it
        e.target.classList.toggle("checked");
    }
    else if (e.target.className === "delete"){ // if i click on the x sign it will delete it
        if (confirm("Are you sure you want to delete this task?")){ // NEW: ask before deleting
            e.target.parentElement.remove();
        }
    }
    else if (e.target.className === "edit"){ // NEW: if i click on the pencil it will edit the text
        let li = e.target.parentElement;
        let newText = prompt("Edit your task:", li.firstChild.textContent); // firstChild is the text of the task
        if (newText === null){ // the user clicked cancel
            return;
        }
        if (newText.trim() === ""){
            alert("Task name cannot be empty.");
            return;
        }
        li.firstChild.textContent = newText.trim();
    }
    else if (e.target.className === "pin"){ // NEW: if i click on the star it will pin / unpin it
        let li = e.target.parentElement;
        if (!li.classList.contains("pinned")){
            li.classList.add("pinned");
            listContainer.prepend(li); // the pinned task goes to the top
        }
        else if (confirm("Do you want to unpin this task? It will return to its original position.")){
            li.classList.remove("pinned");
            reorder();
        }
    }
    save(); // NEW: save after each click so the check / edit / pin stay after refresh
},false);

// NEW: pinned tasks stay on top, the others go back in their original order
function reorder() {
    let tasks = Array.from(listContainer.children); // to transform the list into a real array
    let pinned = tasks.filter(function(task){
        return task.classList.contains("pinned");
    });
    let others = tasks.filter(function(task){
        return !task.classList.contains("pinned");
    });
    others.sort(function(a, b){
        return a.dataset.order - b.dataset.order; // smallest number = oldest task first
    });
    listContainer.replaceChildren(...pinned, ...others);
}

// NEW: pressing enter adds the task without clicking on add
inputBox.addEventListener("keydown",function(e){
    if (e.key === "Enter"){
        addTask();
    }
});

function save() {
    localStorage.setItem('data', listContainer.innerHTML);
 }

function load() {
    listContainer.innerHTML = localStorage.getItem("data") || "";
}

load();