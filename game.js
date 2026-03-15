let player = localStorage.getItem("player")

function login(){

let name = document.getElementById("playerName").value

if(name==""){
alert("Enter name")
return
}

localStorage.setItem("player",name)

location.reload()

}

if(player){
document.getElementById("loginBox").style.display="none"
}
let balance = localStorage.getItem("balance") || 1000

let multiplier = 1
let crashPoint = 0
let running = false
let timer
let betAmount = 0

function updateBalance()localStorage.setItem("balance",balance){
document.getElementById("balance").innerHTML = "Balance: "+balance
}

function startGame(){
if(running) return

betAmount = parseFloat(document.getElementById("bet").value)
if(isNaN(betAmount) || betAmount <= 0){
alert("Enter a valid bet")
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
crashPoint = (Math.random()*5)+1

document.getElementById("result").innerHTML = ""

timer = setInterval(()=>{
multiplier += 0.02
document.getElementById("multiplier").innerHTML = multiplier.toFixed(2)+"x"

if(multiplier >= crashPoint){
clearInterval(timer)
document.getElementById("result").innerHTML = "💥 Crashed at "+multiplier.toFixed(2)+"x"
addHistory("Crash at "+multiplier.toFixed(2)+"x")
running = false
}

},100)
}

function cashout(){
if(!running) return
clearInterval(timer)
let win = betAmount*multiplier
balance += win
updateBalance()
document.getElementById("result").innerHTML = "✅ Won "+win.toFixed(2)
addHistory("Win at "+multiplier.toFixed(2)+"x")
running = false
}

function addHistory(text){
let li = document.createElement("li")
li.innerHTML = text
document.getElementById("historyList").prepend(li)
}

updateBalance()
