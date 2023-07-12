// Program Flow info will be updated and moved to use a more appropriate documentation method.
// Flow 1: Get text from one of the main textareas. sanitizeText() gets rid of \n, whitespace, and pushes to
// the element to an array. sortList() converts the elements to Numbers and sorts the array.
// updateListBox() reinserts the \n in each element, builds a string with them, and updates the textarea with this string.
// addLog() creates several DOM elements, sets their values, including a text area, and places them on the document.

// Flow 2: Restoring; Get the textarea under the same parent node as the child object. Grab the text in the textarea.
// Reformat it such that the commas and spaces are replaced with newlines. Place in the left textarea box

// TODO: Look through code for lines that are similar and reused.
//  I could make generic versions as functions and replace those lines with the functions.
//  I saw someone call those sort of functions hooks but I'm not sure that was right or not.

let oldList = document.querySelector("#oldList");
let newList = document.querySelector("#newList");
let oldButton = document.querySelector("#oldButton");
let newButton = document.querySelector("#newButton");
let matrixEditButton = document.querySelector("#matrixEditButton");
let matrixSetButton = document.querySelector("#matrixSetButton");
let setCheckoutInput = document.querySelector("#setCheckoutInput");
let testButton = document.querySelector("#testButton");
let testButton2 = document.querySelector("#testButton2");
let logList = document.querySelector(".log-list");
let matrix = document.querySelector(".matrix");

let editMode = false;
// I would have used hex codes but the color code when grabbing from a DOM element returns in the rgb(r,g,b) format.
// I may write a function to convert between the two but for now this will do.
const roomColors = {
  "dueOut": "rgb(255, 97, 97)",
  "checkedOut": "rgb(186, 187, 255)",
  "earlyCheckout": "rgb(66, 245, 170",
  "misc": "rgb(237, 237, 237)"
};

let startFloor = 2;
let endFloor = 6;
let floorRoomCount = {
  2: 22,
  3: 25,
  4: 25,
  5: 25,
  6: 25
};

function sanitizeText(text, delimiter) {
  //console.log(text);
  let splitText = text.split(`${delimiter}`);// returns an array of strings.  
  // Trim the whitespace
  let trimText = [];
  for (let str of splitText) { // Use a for of loop, not a for in loop.
    if (str == "") {
      continue;
    }
      trimText.push(str.trim());
  }
  return trimText;
}

function arrayToList(array, separator) {
  // Take a sorted array and create a string with commas separating numbers.
  let tempList = "";
  let finalList = "";
  let numInfo = function(num) { return num + `${separator}` };
  
  for (let num of array) {
    if (tempList == "") {
      tempList = numInfo(num);
    }
    else {
      tempList = tempList + numInfo(num); 
    }
    // Get rid of the unneeded separator at the end.
    finalList = tempList.slice(0, tempList.length - separator.length);
  }
  return finalList;
}

function listToArray(list, separator) {
  let numInfo = function(str) { return str + `${separator}` };
  
  let splitText = list.split(`${separator}`); // Returns an array.
  let listArray = [];
  for (let str of splitText) {
    let trimmedStr = str.trim();
    if (trimmedStr == "") {
      continue;
    }
    else {
      listArray.push(trimmedStr);
    }
  }
}

// Sorts arrays
function sortList(list) {
  let numList = list.map(Number); // convert to an array of numbers
  let sortedList = numList.sort(function(a, b) {
    return a - b;
  });
  
  return sortedList 
}

function repeatCheck(list) {
  let prevNum = 0; // I'll switch this to null or whatever javascript uses later.
  let noRepeatList = [];
  let newCheckoutsList = [];
  // input array should already be sorted. Otherwise this won't work.
  for (let num of list) {
    if (prevNum != num) {
      prevNum = num;
      noRepeatList.push(num);
    }
  }
  return noRepeatList;
}

function listSaveFormat(list) {
  // Take a sorted array and create a string with commas separating numbers.
  return arrayToList(list, ", ");
}

//  Testing phase
function listLoadFormat(text) {
  // Should already be sorted, so I just need to replace the commas with newlines.
  let formattedText = text.replace(/, /g, "\n");
  return formattedText;
}

// TODO: come up with a way to get event target's (restore button) associated main list 
// without having to grab the parentNode and its childNodes.
// Doing it that way means I would need to adjust how I grab the textarea object each time
// I modify the DOM elements I'm making, which is bad.
function restore(event) {
  let textbox = event.target.parentNode.childNodes[2].childNodes[0];
  console.log(textbox);
  updateListBox(oldList, listLoadFormat(textbox.value));
}

function updateListBox(newList, list) {
  newList.value = list;
}

function getTime() {
  let currentDate = new Date();
  let hours = currentDate.getHours(); // Returns type is Number
  let minutes = currentDate.getMinutes();
  let meridiem = "AM"
  
  if (hours > 11) {
    meridiem = "PM"
  }
  hours = hours % 12;
  
  hours = hours.toString();
  minutes = minutes.toString();
  
  if (minutes.length == 1) {
    minutes = "0" + minutes;
  }
  
  if (hours.length == 1) {
    hours = "0" + hours;
  }
  
  return `${hours}:${minutes} ${meridiem}`
}

function addLog(sortedList, newCheckoutList) {
  let entry = document.createElement("li");
  let timestamp = document.createElement("div");
  let listArea = document.createElement("div");
  let roomList = document.createElement("textarea");
  let changeList = document.createElement("textarea");
  let restoreButton = document.createElement("input");
  
  entry.setAttribute("class", "log-entry");
  listArea.setAttribute("class", "list-area");
  
  restoreButton.setAttribute("type", "button");
  restoreButton.value = "Restore";
  
  timestamp.innerHTML = getTime();
  
  let value = listSaveFormat(sortedList);
  roomList.setAttribute("cols", value.length);
  roomList.setAttribute("rows", 1);
  roomList.setAttribute("readonly", "");
  roomList.value = value;
  
  let checkouts = listSaveFormat(newCheckoutList);
  changeList.setAttribute("cols", value.length);
  changeList.setAttribute("rows", 1);
  changeList.setAttribute("readonly", "");
  changeList.value = checkouts;
  
  entry.append(restoreButton);
  entry.append(timestamp);
  listArea.append(roomList);
  listArea.append(changeList);
  entry.append(listArea);
  logList.prepend(entry);
  
  restoreButton.addEventListener("click", restore);
}

function roomNumberFormat(floorNumber, roomNumber) {
  return `${floorNumber}${roomNumber.toString().padStart(2,"0")}`
}
// Draws room matrix. Only the cells with room number.
function drawMatrix() {
  matrix.setAttribute("class", "matrix");
  // I'll either make a div for each row and use flexbox or 
  // I'll try using flexbox wrapping.
  
  for (let i = startFloor; i <= endFloor; i++) {
    let row = document.createElement("div");
    row.setAttribute("class", "matrix-row");
    for (let j = 0; j <= floorRoomCount[i]; j++) {
      drawCell(`${i}${j.toString().padStart(2,'0')}`, row);
    }
    matrix.append(row);
  }
  
}

function drawCell(roomNumber, parent) {
  let cell = document.createElement("div");
  cell.setAttribute("class", "matrix-cell");
  cell.setAttribute("id", `room-${roomNumber}`);
  cell.style.backgroundColor = roomColors.misc;
  //cell.innerHTML = `${roomNumber}`;
  cell.addEventListener("click", cellClick);
  
  let cellText = document.createElement("p");
  cellText.innerHTML = `${roomNumber}`;
  cell.append(cellText);
  parent.append(cell);
}

function cellClick(event) {
  if (editMode) {
    let roomNumber = event.target.innerHTML;
    cycleCellStatus(roomNumber);
  }
}

// Set the status of each non-base status cell. Initially, this will mark the due-outs red or whatever.
function setCellStatus(roomNumber, colorKey) {
  let cell = document.querySelector(`#room-${roomNumber}`);
  if (colorKey) {
    cell.style.backgroundColor = roomColors[colorKey];  
  }
}

function cycleCellStatus(roomNumber) {
  let cell = document.querySelector(`#room-${roomNumber}`); 
  console.log(cell.style.backgroundColor);
  cell.style.backgroundColor = roomFSM(cell.style.backgroundColor);
}

// A Finite State Machine for changing a room cell's color.
function roomFSM(state) {
  switch(state) {
    case roomColors.dueOut:
      return roomColors.checkedOut;
      break;
    case roomColors.checkedOut:
      return roomColors.earlyCheckout;
      break;
    case roomColors.earlyCheckout:
      return roomColors.misc;
      break;
    case roomColors.misc:
      return roomColors.dueOut;
      break;
    default:
      return roomColors.misc;
      break;
  }
}

// Grab the items in the right textarea and append them to the left textarea.
// Then sort and update the left textarea, make a log.
oldButton.addEventListener("click", function() {
  // Append the checkouts list to the old list.
  let appendedList = oldList.value + "\n" + newList.value;
  // Sort the whole thing again.
  let list = sanitizeText(appendedList, "\n");
  let sortedList = sortList(list);
  let repeatsRemovedList = repeatCheck(sortedList);
  let strList = arrayToList(repeatsRemovedList, "\n");
  updateListBox(oldList, strList);
  
  console.log(sortedList);
  
  // Get just the new checkouts. I could check if it has already been sorted.
  // Todo: Have the changelist only show non-repeats relative to the main list.
  let changeList = sanitizeText(newList.value, "\n");
  let sortedChangeList = sortList(changeList);
  addLog(sortedList, changeList);
  
  for (let cell of sortedList) {
    setCellStatus(cell, "checkedOut");
  }
  
  // Clear the new checkouts input box.
  newList.value = "";
});

newButton.addEventListener("click", function() {
  let list = sanitizeText(newList.value, "\n");
  let sortedList = sortList(list);
  let repeatsRemovedList = repeatCheck(sortedList);
  updateListBox(newList, arrayToList(repeatsRemovedList, "\n"));
});

document.addEventListener("DOMContentLoaded", function() {
  drawMatrix();
});

matrixEditButton.addEventListener("click", function() {
  editMode = !editMode; // Toggle edit mode

  let elements = document.querySelectorAll(".edit-mode-ui");
  for (let element of elements) {
    if (editMode) {
      element.style.visibility = "visible"
    }
    else {
      element.style.visibility = "hidden"
    }
  }
  
});

matrixSetButton.addEventListener("click", function() {
  let list = sanitizeText(setCheckoutInput.value, " ");
  let sortedList = sortList(list);
  for (let cell of sortedList) {
    setCellStatus(cell, "dueOut");
  }
});

testButton.addEventListener("click", function() { });

testButton2.addEventListener("click", function() {
  setCellStatus(300,"earlyCheckout");
});