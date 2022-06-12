//Author manu12121999@gmail.com

let num_input = 0
let num_levels = 0

let sorter = new Array(num_levels * num_input).fill(0)
let permutations = []
let startId = 0

let canvasEl = document.getElementById("sort_canvas")
ctx = canvasEl.getContext("2d")

//draw a connection between two elements
function drawToCanvas(elem1,elem2)
{
    let bodyRect = document.getElementById("sorting_network").getBoundingClientRect()
    

    let startEl = elem1.getBoundingClientRect()
    let startY = startEl.top - bodyRect.top
    let startX = startEl.left - bodyRect.left
    
    let stopEL = elem2.getBoundingClientRect()
    let offsetY = stopEL.top - bodyRect.top
    let offsetX = stopEL.left - bodyRect.left

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    //ctx.lineTo(offsetX, offsetY);
    let length = Math.abs(offsetY-startY);
    let curvature = length/3
    ctx.bezierCurveTo(startX+curvature,startY, offsetX+curvature, offsetY,offsetX, offsetY)
    ctx.stroke();
}

//draw all connectors
function drawConnections()
{

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    for(let index = 0; index < sorter.length; index++)
    {
        elem1 = document.getElementById("box"+index)
        index2 = Number.parseInt(sorter[index])+index
        elem2 = document.getElementById("box"+index2)
        drawToCanvas(elem1,elem2)
    }
}

//convert "box123" to 123
function IdToInt(text){
    return Number.parseInt(text.substring(3, text.length))
}

//determines whether two inputs can be connected
function allowDrop(ev) {
    let ownid = IdToInt(ev.target.id)
    if(Math.floor(startId/num_input) == Math.floor(ownid/num_input))
    {
        ev.preventDefault();
    }
}

//start dragging 
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    startId = IdToInt(ev.target.id);
}
  
//stop dragging
function drop(ev) {
    ev.preventDefault();
    let id = ev.target.id
    let stopIndex = IdToInt(id)

    let start = ev.dataTransfer.getData("text");
    let startID = IdToInt(start)
    //ev.target.appendChild(document.getElementById(data));
    
    let startEl = document.getElementById("box"+startID)
    let level = Math.floor(stopIndex/num_input)
    changeSorter(level, stopIndex%num_input,startID-stopIndex)

    drawToCanvas(ev.target, startEl)
}

//frontend
//////////////////////////////////////////
//backend

//pad the array with zeros
function padArrayStart(arr, desiredLength){
    return Array(desiredLength - arr.length).fill(0).concat(arr);
 }

 //decimal to binary format
function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

//binary number to interger list
function bin2list(bin, desiredLength) {
    list = []
    for (const c of bin) {
        list.push(Number.parseInt(c))
    }
    return padArrayStart(list,desiredLength)
}

//checks if the sorter can sort the combination
function check_sorter_functionality(comb){
    for(let level = 0 ; level < num_levels; level++){ 
        let input = []
        for(let i = 0 ; i< num_input; i++){
            let index = level*num_input+i
            let sorterValue = Number.parseInt(sorter[index])
            if(sorterValue >= 0){
                input.push(Math.max(comb[i], comb[i + sorterValue]))
                
            }
            else{
                input.push(Math.min(comb[i], comb[i + sorterValue]))
            }
        }
        comb = input
    }
    let nonzero = comb.filter(function(x){
        return x===1
    }).length 
    for(let i = 0; i< nonzero; i++){
        if(comb[i]===0){
            return false
        }
    }
    return true
}

//called whenever the size changes
function sizeChange()
{
    num_input = document.getElementById("Inputs").value
    num_levels = document.getElementById('Depth').value

    //backend stuff
    sorter = new Array(num_levels * num_input).fill(0)
    permutations = new Array()
    for(let i = 0;i < 2**num_input; i++){
        let i2 = dec2bin(i)
        permutations.push(bin2list(i2,num_input))
    }

    //draw the number fields
    let connectorsEl = document.getElementById("connectors")
    numberfields = ``
    for(let i = 0; i< num_input; i++){
        for(let level = 0; level< num_levels; level++){
            let index = level * num_input + i
            numberfields+=`<input id="input${index}" type="number" id="Inputs" max="${num_input-i-1}" min="${-i}"  oninput="valueChange(${level},${i})" value="0">`
        }
        numberfields+=`<br></br>`
    }
    connectorsEl.innerHTML = numberfields

    //drawConnections
    let connectors = ``
    let connectorsRenderEl = document.getElementById("connectorsRender")
    for(let i = 0; i< num_input; i++){
        connectors+=`<div class="row">
        <div class="drop-targets">`
        for(let level = 0; level< num_levels; level++){
            let index = level * num_input + i
            
            connectors+=`<div class="box" id="box${index}" ondrop="drop(event)" ondragover="allowDrop(event)" draggable="true" ondragstart="drag(event)"></div>`
        }
        connectors+=`</div></div>`
    }
    connectorsRenderEl.innerHTML = connectors

    //resize canvas
    let bodyRect = document.getElementById("sorting_network").getBoundingClientRect()
    canvasEl.width = bodyRect.width
    canvasEl.height = bodyRect.height

    //reset result
    let resultEl = document.getElementById("result")
    resultEl.innerHTML = ``
}

//called whenever something about the sorter changes
function changeSorter(level, position, value)
{
    let index = level*num_input + position
    oldvalue = sorter[index]
    sorter[index] = value
    let valueEl =  document.getElementById("input"+index)
    valueEl.value = value
    value = Number.parseInt(sorter[index])

    let oldcorresponding = index + oldvalue
    let oldcorrespondingEL = document.getElementById("input"+oldcorresponding)
    if(oldvalue != 0)
    {        
        oldcorrespondingEL.value = 0
        sorter[oldcorresponding]=0
        oldcorrespondingEL.style.borderColor = "White"
    }

    if(value >= num_input-position || value < -position)
    {
        valueEl.style.borderColor = "red"
    }
    else{ // valid input
        valueEl.style.borderColor = "Green"
        let corresponding = index+value


        let correspondingEL = document.getElementById("input"+corresponding)
        if(oldvalue != 0)
        {        
            oldcorrespondingEL.value = 0
            sorter[oldcorresponding] = 0
            oldcorrespondingEL.style.borderColor = "White"
        }
        let CC = Number.parseInt(correspondingEL.value) + corresponding
        document.getElementById("input"+ CC).value = 0
        sorter[CC] = 0
        document.getElementById("input"+ CC).style.borderColor = "White"

        correspondingEL.value = -sorter[index]
        sorter[corresponding] = -sorter[index]
        correspondingEL.style.borderColor = "Green"
    }
    drawConnections()
    calc_error()
}

//value of inputfield changes
function valueChange(level, position){
    /*for(let i = 0; i< num_levels* num_input; i++){
        let valueEl =  document.getElementById("input"+i)
        sorter[i] = valueEl.value
        value = Number.parseInt(sorter[i])
        if(value >= num_input-(i%num_levels)){
            valueEl.style.borderColor = "red"
        }
        else{
            valueEl.style.borderColor = "green"
            let corresponding = i+value
            document.getElementById("input"+corresponding).value = -sorter[i]
        }
    }*/
    let index = level*num_input +position
    let valueEl =  document.getElementById("input"+index)
    changeSorter(level, position, Number.parseInt(valueEl.value))
}

//calculate whether it can sort or not
function calc_error(){
 
    let unsorting_permuts = permutations.find(function(perm){
        return check_sorter_functionality(perm)===false
    })
    let resultEl = document.getElementById("result")
    if(unsorting_permuts != undefined) //TODO
        resultEl.innerHTML = `<p style="color:#FF0000";>cannot sort for example ${unsorting_permuts}</p>`
    else{
        resultEl.innerHTML= `<p style="color:#00AA00";>can sort everything</p>`
    }
    return true
}
