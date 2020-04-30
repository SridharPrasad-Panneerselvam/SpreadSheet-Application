//Declaration of global variables
var init_rows = 6;
var init_cols = 6;
var max_cols = 26;

//Declaring Set variable constants
const selRow = new Set();
const selCol = new Set();

//Declaring the rxjs Subject observable constants
const sub = new rxjs.Subject();
const subRow = new rxjs.Subject();

// This function is used to higlight the selected Rows
const selectedRow = (x) => {
    // loop to add or remove the highlight based on the requirement
    if (x.classList.contains("highlight")) {
        x.classList.remove("highlight");
        selRow.delete(x);
    }
    else {
        x.classList.add("highlight");
        selRow.add(x);
    }
}

// This function is used to higlight the selected Columns
const selectedColumn = (x) => {
    // loop to add or remove the highlight based on the requirement
    if (x.classList.contains("highlight")) {
        selCol.delete(x.id);
    }
    else {
        selCol.add(x.id);
    }
    for (let i = 0; i < init_rows; i++) {
        let id = x.id[0];
        let newid = id + i;
        let col = document.getElementById(newid);
        col.classList.toggle("highlight");
    }
}

//This function helps to check the formula entered as which type it is and assign the operator to carry out the required math functionaility
const cellCalculation = (td) => {
    //rxjs event has been started to monitor the value entered in the cell
    //debounce time has been set to 800
    rxjs.fromEvent(td, 'input').pipe(rxjs.operators.debounceTime(800)).subscribe(i => {
        //if the user types =A1+A2 , it will go into the below loop
        if (td.innerText.length > 5 && td.innerText.startsWith("=", 0) && !td.innerText.includes("SUM")) {
            let initString = td.innerText.substring(1, td.innerText.length);
            // the different math operations are stord in an array
            let signs = ["+", "-", "*", "/"];
            let op = "";
            for (let i = 0; i < initString.length; i++) {
                //this loop checks the operator the user enters
                if (initString.includes(signs[i])) {
                    op = signs[i];
                }
            }
            let newArray = [];
            initString.split(op).forEach(k => {
                newArray.push(k);
            })
            //The different operator the user enters is set as per requirement using a switch case statement
            if (newArray.length == 2) {
                switch (true) {
                    case (op === "+"): {
                        //setting attributes for operators
                        td.setAttribute("type", "sum");
                        td.setAttribute("expression", "true");
                        calculate(td, "+");
                        break;
                    }
                    case (op === "-"): {
                        td.setAttribute("type", "diff");
                        td.setAttribute("expression", "true");
                        calculate(td, "-");
                        break;
                    }
                    case (op === "*"): {
                        td.setAttribute("type", "mul");
                        td.setAttribute("expression", "true");
                        calculate(td, "*");
                        break;
                    }
                    case (op === "/"): {
                        td.setAttribute("type", "div");
                        td.setAttribute("expression", "true");
                        calculate(td, "/");
                        break;
                    }
                    //default case
                    default: {
                        window.alert("Not a valid formula");
                    }
                }
            }
            //if the user types =SUM( , it will go into the below loop
        } else if (td.innerText.startsWith("=SUM(") && td.innerText.endsWith(")")) {
            let stringSplit = td.innerText.substring(5, td.innerText.length - 1);
            let ar = [];
            //splitting the entered details with : and storing it in an array
            stringSplit.split(":").forEach(k => {
                if (k.length > 1)
                    ar.push(k);
                else {
                    window.alert("Not a valid formula");
                }
            });
            if (ar.length == 2) {
                //calling another function
                addMultipleCells(td, ar);
            }
            //If the user deletes a cell's content the formula is removed
        } else if (td.getAttribute("expression") === "true" && i.inputType === "deleteContentBackward") {
            td.removeAttribute("type");
            td.removeAttribute("expression");
        }
        sub.next(i.target);
    });
}

//This function performs arithmetic within a cell range
//It is used to observe and carry out the consecutive sum through the rows as well as the columns in a specified cell range
// This function is used to observe and carry out the consecutive sum through the rows as well columns in the specified cell range
const addMultipleCells = (td, ar) => {
    // to retrieve character at 0th position
    if (ar[0].substring(1, ar[0].length) == ar[1].substring(1, ar[1].length)) {
        td.setAttribute("expression", "true")
        let obs1 = sub.subscribe(x => {
            if (td.getAttribute("expression")) {
                let test = 0;
                let a = ar[0].charCodeAt(0);
                let b = ar[1].charCodeAt(0);
                for (i = a; i <= b; i++) {
                    //addition operation
                    test = test + parseInt(document.getElementById(String.fromCharCode(i) + ar[0].substring(1, ar[0].length)).innerText);
                }
                td.innerText = test;
            } else { 
                //unsubscribing the observer
                obs1.unsubscribe() 
            }
        });
    
    } else if (ar[0].charAt(0) == ar[1].charAt(0)) {
        td.setAttribute("expression", "true")
        let chara = parseInt(ar[0].substring(1, ar[0].length));
        let charb = parseInt(ar[1].substring(1, ar[1].length));
        let obs2 = subRow.subscribe(x => {
            if (x < charb && x >= chara) {
                charb = parseInt(charb) + 1;
            } else if (x < chara) {
                chara = parseInt(chara) + 1;
                charb = parseInt(charb) + 1;
            }
        });
        let obs3 = sub.subscribe(x => {
            if (td.getAttribute("expression")) {
                let test = 0;
                for (i = chara; i <= charb; i++) {
                    test = test + parseInt(document.getElementById(ar[0].charAt(0) + i).innerText);
                }
                td.innerText = test;
            } else {
                //unsubscribing the observers
                obs2.unsubscribe();
                obs3.unsubscribe();
            }
        });
    } else {
        console.log("invalid");
    }
}
//This function operates the functionality entered in the cell
const calculate = (td, type) => {
    let initString = td.innerText.substring(1, td.innerText.length);
    // the different math operations are stord in an array
    let signs = ["+", "-", "*", "/"];
    let op = "";
    for (let i = 0; i < initString.length; i++) {
        //this loop checks the operator the user enters
        if (initString.includes(signs[i])) {
            op = signs[i];
        }
    }
    let arr = [];
    initString.split(op).forEach(k => {
            arr.push(k);
    })

    let firstElement = document.getElementById(arr[0]);
    let secondElement = document.getElementById(arr[1]);
    //Upon subscribing the various math cases are executed as per the operator entered by the user
    let obs = sub.subscribe(x => {
        let sum = 0;
        switch (true) {
            case (td.getAttribute("expression") && td.getAttribute("type") == "sum"): {
                td.innerText = parseInt(firstElement.innerText) + parseInt(secondElement.innerText);
                break;
            }
            case (td.getAttribute("expression") && td.getAttribute("type") == "mul"): {
                td.innerText = parseInt(firstElement.innerText) * parseInt(secondElement.innerText);
                break;
            }
            case (td.getAttribute("expression") && td.getAttribute("type") == "diff"): {
                td.innerText = parseInt(firstElement.innerText) - parseInt(secondElement.innerText);
                break;
            }
            case (td.getAttribute("expression") && td.getAttribute("type") == "div"): {
                td.innerText = parseInt(firstElement.innerText) / parseInt(secondElement.innerText);
                break;
            }
            default:
                {
                    //Unsubscription of the subject
                    obs.unsubscribe();
                }
        }
    });
}

//Creating a function to load the rows and columns dynamically
const reload = () => {
    let body = document.getElementsByTagName("body")[0];

    let table = document.createElement("table");
    for (let i = 0; i < init_rows; i++) {
        let tr = document.createElement("tr");
        tr.setAttribute("id", i);

        for (let j = 0; j < init_cols; j++) {
            let td = document.createElement("td");

            if (i != 0) {
                //Setting attibute using ASCII values
                td.setAttribute("id", String.fromCharCode(j + 64) + i);
            }
            else {
                td.setAttribute("id", String.fromCharCode(j + 64) + i);
            }

            if (i == 0 & j > 0) {
                let text = document.createTextNode(String.fromCharCode(j + 64));
                //adding event listeners to select the column
                td.addEventListener("click", function () {
                    selectedColumn(td);
                }, false);
                td.appendChild(text);
            }

            else if (j == 0 & i > 0) {
                let text = document.createTextNode(i);
                //adding eventlistener to select the row
                td.addEventListener("click", function () {
                    selectedRow(tr);
                }, false);
                td.appendChild(text);
            }
            else if (i == 0 & j == 0) {
                td.setAttribute("contenteditable", "false");
            }
            else {
                td.setAttribute("contenteditable", "true");
                cellCalculation(td);
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    body.appendChild(table);
}

//calls the function upon loading the window
window.onload = reload();

//Function addrow to add the rows below the selected row and also alerts the user on selection of row
// The observer emits the values entered in the cells of the new row added 
const addRow = () => {
    if (selRow.size != 1 || selRow.size == 0) {
        alert("Please select one row")
    }
    else if (selRow.size == 1) {
        let table = document.getElementsByTagName("table")[0];
        let iterator = selRow.values();
        let row = iterator.next().value;
        let index = row.rowIndex + 1;
        //this function uses the index to add the row
        subRow.next(index - 1);
        let newRow = table.insertRow(index);
        newRow.setAttribute("id", index);
        for (let i = 0; i < init_cols; i++) {
            let newCell = newRow.insertCell(i);
            if (i == 0) {
                newCell.setAttribute("contentidtable", "false");
                newCell.setAttribute("id", index);
                newCell.addEventListener("click", function () {
                    selectedRow(newRow);
                }, false);
            }
            else {
                newCell.setAttribute("contenteditable", "true");
                newCell.setAttribute("id", String.fromCharCode(i + 64) + index);
                selCol.forEach(x => {
                    //let sel = x.id;
                    let newid = x.charCodeAt(0) - 64;
                    if (newid == i)
                        newCell.setAttribute("class", "highlight");
                });
                cellCalculation(newCell);
            }
        }
        init_rows = init_rows + 1;
        addIdToNewRow(index);
    }
}


//Function to delete the row selected based on the selected index and also alerts the user on deletion of the last few rows
const deleteRow = () => {
    if (init_rows < 3) {
        alert("You are not allowed to delete the last row");
    }
    else {
        if (selRow.size != 1 || selRow.size == 0) {
            alert("Please select one row");
        }
        else {
            let table = document.getElementsByTagName("table")[0];
            let iterator = selRow.values();
            let row = iterator.next().value;
            let index = row.rowIndex;
            let toDeleteRow = table.deleteRow(index);
            selRow.clear();
            init_rows = init_rows - 1;
            addIdToNewRow(index);
        }
    }
}

//Function to rearrange the table when the new row has been added
const addIdToNewRow = (index) => {
    let table = document.getElementsByTagName("table")[0];
    let x = table.rows;
    for (let i = index; i < init_rows; i++) {
        for (let j = 0; j < init_cols; j++) {
            let y = x[i].cells;
            y[0].innerText = i;
            y[j].setAttribute("id", String.fromCharCode(j + 64) + i);
        }
    }

}

//Event listener to add/delete a row by getting the element by ID
document.getElementById("addRow").addEventListener("click", addRow, false);
document.getElementById("deleteRow").addEventListener("click", deleteRow, false);


//Function to add column next to the selected column and also alerts the user on selection of column
const addColumn = () => {

    if (init_cols > max_cols) {
        alert("You are not allowed to add more than 26 columns");
    }
    else {
        if (selCol.size != 1 || selCol.size == 0) {
            alert("Please select one column");
        }
        else {
            let table = document.getElementsByTagName("table")[0];
            let iterator = selCol.values();
            let column = iterator.next().value;
            let newid = column.charCodeAt(0) - 64;
            let rel = newid + 1;
            for (let i = 0; i < init_rows; i++) {
                let id = column[0];
                let col = id + i;
                let oldtd = document.getElementById(col);
                let td = document.createElement("td");
                oldtd.insertAdjacentElement("afterend", td);
                if (i == 0) {
                    td.setAttribute("contentidtable", "false");
                    //helps to set id as A1,A2,A3,B1 etc
                    td.setAttribute("id", String.fromCharCode(newid + 65) + i);
                    td.addEventListener("click", function () {
                        selectedColumn(td);
                    }, false);
                }
                else {
                    td.setAttribute("contenteditable", "true");
                    td.setAttribute("id", String.fromCharCode(newid + 65) + i)
                    cellCalculation(td);
                }
            }
            init_cols = init_cols + 1;
            addIdtoNewColumn(rel);
        }

    }
}

//Function to delete the selected column and is iterated in all the rows.
//It alerts the user on deletion of the last few columns
const deleteColumn = () => {
    if (init_cols < 3) {
        alert("You are not allowed to delete the last column");
    }
    else {
        if (selCol.size != 1 || selCol.size == 0) {
            alert("Please select one column");
        }
        else {
            let table = document.getElementsByTagName("table")[0];
            let iterator = selCol.values();
            let column = iterator.next().value;
            let newid = column.charCodeAt(0) - 64;
            let delCol = newid;
            let x = table.rows;
            for (let i = 0; i < init_rows; i++) {
                x[i].deleteCell(delCol);
            }
            selCol.clear();
            init_cols = init_cols - 1;
            rearrangeIdtoNewColumn(delCol);
        }
    }
}

//Function to rearrange the column once the column has been added/deleted
const addIdtoNewColumn = (rel) => {
    let table = document.getElementsByTagName("table")[0];
    let x = table.rows;
    for (let i = 0; i < init_rows; i++) {
        for (let j = rel; j < init_cols; j++) {
            let y = x[i].cells;
            if (i == 0) {
                y[j].innerText = String.fromCharCode(j + 64);
            }
            y[j].setAttribute("id", String.fromCharCode(j + 64) + i);
        }
    }
}

//Function to rearrange the column once the column has been added/deleted
const rearrangeIdtoNewColumn = (delCol) => {
    let table = document.getElementsByTagName("table")[0];
    let x = table.rows;
    for (let i = 0; i < init_rows; i++) {
        for (let j = delCol; j < init_cols; j++) {
            let y = x[i].cells;
            if (i == 0) {
                y[j].innerText = String.fromCharCode(j + 64);
            }
            y[j].setAttribute("id", String.fromCharCode(j + 64) + i);
        }
    }
}

//eventlisteners
document.getElementById("addColumn").addEventListener("click", addColumn, false);
document.getElementById("deleteColumn").addEventListener("click", deleteColumn, false);

//This function will export the table data into CSV
const export_table_to_csv = (html, filename) => {
    let csv = [];
    let rows = document.querySelectorAll("table tr");
    //The below for loop loops through every row to traverse through each td (basically cell)
    //If column and row header is not imported
    for (let i = 1; i < rows.length; i++) {
    //for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll("td");
        //This loop traverses through each input field of the table
        for (let j = 1; j< cols.length; j++) {
        //for (let j = 0; j < cols.length; j++) {
            let newid = cols[j].id;
            let value = document.getElementById(newid).innerText;
            row.push(value);
        }
        csv.push(row.join(","));
    }
    //This will call the download CSV function
    download_csv(csv.join("\n"), filename);
}

const csvexport = () => {
    let html = document.querySelector("table").outerHTML;
    export_table_to_csv(html, "table.csv");
}


//this function will download the CSV upon clicking the download CSV button
const download_csv = (csv, filename) => {
    let csvFile;
    let downloadLink;

    //This is basically the csv file
    csvFile = new Blob([csv], { type: "text/csv" });

    //This is the download link
    downloadLink = document.createElement("a");

    //This is the filename that will of the CSV that will be downloaded
    downloadLink.download = filename;

    //A link to the file needs to be create and the link should not be displayed
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";

    //The link needs to be appended to the DOM
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

//Function to import the csv the file and append it in our spreadsheet.
const Upload = () => {
    let fileUpload = document.getElementById("fileUpload");
    //Using regex to check the csv file name
    let regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            let reader = new FileReader();
            reader.onload = function (e) {
                let table = document.getElementsByTagName("table")[0];
                let x = table.rows;
                //the below deletes the existing table when the csv file is being uploaded
                for (j = 0; j < x.length; j++) {
                    // let index = j + 1;
                    table.deleteRow(j);
                    j = j - 1;
                }
                let body = document.getElementsByTagName("body")[0];
                //clearing the set so that the values entered in the table before importing are removed 
                selCol.clear();
                selRow.clear();
                body.removeChild(table);
                let rows = e.target.result.split("\n");
                init_rows = rows.length;
                for (let i = 0; i < rows.length; i++) {
                    let cell = rows[0].split(",");
                    if (cell.length > max_cols) {
                        alert("Showing maximum possible columns");
                        init_cols = max_cols;
                        break;
                    }
                    else {
                        let temp = cell.length + 1;
                        init_cols = temp;
                    }
                }
                //calling the reload function so that the csv is exported with the properties of the existing table 
                reload();
                let table1 = document.getElementsByTagName("table")[0];
                let x1 = table1.rows;
                let r = e.target.result.split("\n");
                for (let l = 0, i = 1; l < r.length, i < init_rows; i++ , l++) {
                    let cell = r[l].split(",");
                    if (cell.length < max_cols) {
                        for (let k = 0, j = 1; k < cell.length, j < init_cols; k++ , j++) {
                            let y = x1[i].cells;
                            y[j].innerText = cell[k];
                        }
                    }
                    else {
                        for (let k = 0, j = 1; k < max_cols, j < init_cols; k++ , j++) {
                            let y = x1[i].cells;
                            y[j].innerText = cell[k];
                        }
                    }
                }

            }
            reader.readAsText(fileUpload.files[0]);
            div_hide();

        } else {
            alert("This browser does not support HTML5.");
            div_hide();
        }
    } else {
        alert("Please upload a valid CSV file.");
        div_hide();
    }
}

const div_show = () => {
    document.getElementById('upload').style.display = "block";
}

const div_hide = () => {
    document.getElementById('upload').style.display = "none";
}

//event listeners added for various functions
document.getElementById("exportCsv").addEventListener("click", csvexport, false);
document.getElementById("uploadCsv").addEventListener("click", div_show, false);
document.getElementById("closeButton").addEventListener("click", div_hide, false);
document.getElementById("CSVUpload").addEventListener("click", Upload, false);