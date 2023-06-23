// Flow 1: Get text from one of the main textareas. sanitizeText() gets rid of \n, whitespace, and pushes to
// the element to an array. sortList() converts the elements to Numbers and sorts the array.
// updateListBox() reinserts the \n in each element, builds a string with them, and updates the textarea with this string.
// addLog() creates several DOM elements, sets their values, including a text area, and places them on the document.

// Flow 2: Restoring; Get the textarea under the same parent node as the child object. Grab the text in the textarea.
// Reformat it such that the commas and spaces are replaced with newlines. Place in the left textarea box

// Next Objective: Check the right textarea for repeats after sorting. Remove them.
// When adding the new rooms to the left textarea, check for repeats again and remove them.
// Clear the right textarea when you hit the log button.

let oldList = document.querySelector("#oldList");
let newList = document.querySelector("#newList");
let oldButton = document.querySelector("#oldButton");
let newButton = document.querySelector("#newButton");
let logList = document.querySelector("#log-list");

function sanitizeText(text) {
  //console.log(text);
  let splitText = text.split("\n");// returns an array of strings.  
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

// TODO: updateListBox already inserts newlines, so I end up with double newlines currently.
// It currently takes and array and converts it to a string. I think I need to rework that function to take strings and
// I'll do whatever array to string or backwards stuff before I call it.
function restore(event) {
  let textbox = event.target.parentNode.childNodes[2];
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

// Grab the items in the right textarea and append them to the left textarea.
// Then sort and update the left textarea, make a log.
oldButton.addEventListener("click", function() {
  // Append the checkouts list to the old list.
  oldList.value = oldList.value + "\n" + newList.value;
  
  // Sort the whole thing again.
  let list = sanitizeText(oldList.value);
  let sortedList = sortList(list);
  console.log(sortedList);
  // get the new checkouts. An optimization opportunity is to only sanitize and sort this one if I haven't
  // already. Normal operation would have me sort the new checkouts anyways before I report them to the
  // Housekeepers. For now, I'll do all text cleaning stuff anyway.
  let changeList = sanitizeText(newList.value);
  let sortedChangeList = sortList(changeList);
  let repeatsRemovedList = repeatCheck(sortedList);
  
  let strList = arrayToList(repeatsRemovedList, "\n");
  updateListBox(newList, strList);
  addLog(sortedList, changeList);
  
  newList.value = "";
});

newButton.addEventListener("click", function() {
  let list = sanitizeText(newList.value);
  let sortedList = sortList(list);
  let repeatsRemovedList = repeatCheck(sortedList);
  updateListBox(newList, arrayToList(repeatsRemovedList, "\n"));
});