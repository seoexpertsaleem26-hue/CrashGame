let balance = localStorage.getItem("balance") || 1000
let multiplier = 1
let crashPoint = 0
let running = false
let timer
let betAmount = 0

let canvas = document.getElementById("graph")
let ctx = canvas ? canvas.getContext("2d") : null
let x = 0

function updateBalance(){
document.getElementById("balance").innerHTML = "Balance: " + balance
localStorage.setItem("balance", balance)
}

function startGame(){

if(running) return

betAmount = parseFloat(document.getElementById("bet").value)

if(isNaN(betAmount) || betAmount <= 0){
alert("Enter valid bet")
return
}

if(betAmount > balance){
alert("Not enough balance")
return
}

balance -= betAmount
updateBalance()

multiplier = 1
running = true
x = 0

crashPoint = (Math.random()*5)+1

document.getElementById("result").innerHTML = ""

timer = setInterval(()=>{

multiplier += 0.02

document.getElementById("multiplier").innerHTML =
multiplier.toFixed(2) + "x"

drawGraph()

if(multiplier >= crashPoint){

clearInterval(timer)

document.getElementById("result").innerHTML =
"💥 Crashed at " + multiplier.toFixed(2) + "x"

addHistory("Crash at " + multiplier.toFixed(2) + "x")

running = false

}

},100)

}

function cashout(){

if(!running) return

clearInterval(timer)

let win = betAmount * multiplier

balance += win

updateBalance()

document.getElementById("result").innerHTML =
"✅ Won " + win.toFixed(2)

addHistory("Win at " + multiplier.toFixed(2) + "x")

running = false

}

function drawGraph(){

if(!ctx) return

ctx.clearRect(0,0,400,200)

ctx.beginPath()

ctx.moveTo(0,200)

ctx.lineTo(x,200-(multiplier*20))

ctx.strokeStyle = "lime"

ctx.stroke()

x += 5

}

function addHistory(text){

let li = document.createElement("li")

li.innerHTML = text

document.getElementById("historyList").prepend(li)

}

updateBalance()

