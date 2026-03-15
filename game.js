document.addEventListener("DOMContentLoaded", function(){

let balance = localStorage.getItem("balance") || 1000
let multiplier = 1
let crashPoint = 0
let running = false
let timer
let betAmount = 0

let plane = document.getElementById("plane")
let planeX = 50
let planeY = 220

let cashSound = document.getElementById("cashSound")
let crashSound = document.getElementById("crashSound")

let canvas = document.getElementById("graph")
let ctx = canvas.getContext("2d")
let x = 0

// Pending requests
let pendingDeposits = []
let pendingWithdraws = []

function updateBalance(){
    document.getElementById("balance").innerText = "Balance: " + balance
    localStorage.setItem("balance", balance)
}

// --------- Game Functions ---------
function startGame(){
    if(running) return

    betAmount = parseFloat(document.getElementById("bet").value)
    if(!betAmount || betAmount <=0){alert("Enter bet amount"); return}
    if(betAmount>balance){alert("Not enough balance"); return}

    balance -= betAmount
    updateBalance()

    multiplier = 1
    running = true
    x = 0
    planeX = 50
    planeY = 220
    plane.style.left = planeX + "px"
    plane.style.top = planeY + "px"

    crashPoint = Math.random()*5+1
    document.getElementById("result").innerHTML = ""

    timer = setInterval(()=>{
        multiplier += 0.02
        document.getElementById("multiplier").innerHTML = multiplier.toFixed(2)+"x"
        drawGraph()

        if(multiplier >= crashPoint){
            clearInterval(timer)
            running = false
            document.getElementById("result").innerHTML = "💥 Crashed at "+multiplier.toFixed(2)+"x"
            addHistory("Crash "+multiplier.toFixed(2)+"x")
            crashSound.play()
        }
    },50)
}

function cashout(){
    if(!running) return
    clearInterval(timer)
    running = false
    let win = betAmount*multiplier
    balance += win
    updateBalance()
    document.getElementById("result").innerHTML = "✅ Won "+win.toFixed(2)
    addHistory("Win "+multiplier.toFixed(2)+"x")
    cashSound.play()
}

function drawGraph(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.beginPath()
    ctx.moveTo(0,200)
    ctx.quadraticCurveTo(x/2,200-(multiplier*10),x,200-(multiplier*20))
    ctx.strokeStyle = "lime"
    ctx.lineWidth = 2
    ctx.stroke()
    x += 4
    planeX += 4
    planeY -= 0.5
    plane.style.left = planeX + "px"
    plane.style.top = planeY + "px"
}

function addHistory(text){
    let li = document.createElement("li")
    li.innerText = text
    document.getElementById("historyList").prepend(li)
}

// --------- Deposit ---------
function depositRequest(){
    let amt = parseFloat(document.getElementById("depositAmount").value)
    let txn = document.getElementById("depositTxn").value.trim()
    if(!amt || amt <=0){alert("Enter valid amount"); return}
    if(!txn){alert("Enter Transaction ID"); return}
    pendingDeposits.push({amount: amt, txnId: txn})
    alert("Deposit request submitted. Admin will verify.")
    document.getElementById("depositAmount").value=""
    document.getElementById("depositTxn").value=""
    console.log("Pending Deposits:", pendingDeposits)
}

// Admin verifies deposit
function verifyDeposit(index){
    let deposit = pendingDeposits[index]
    balance += deposit.amount
    updateBalance()
    pendingDeposits.splice(index,1)
    alert("Deposit verified! New balance: "+balance)
}

// --------- Withdraw ---------
function withdrawRequest(){
    let amt = parseFloat(document.getElementById("withdrawAmount").value)
    let account = document.getElementById("withdrawAccount").value.trim()
    if(!amt || amt <=0){alert("Enter valid amount"); return}
    if(amt>balance){alert("Insufficient balance"); return}
    if(!account){alert("Enter your JazzCash/EasyPaisa number"); return}
    pendingWithdraws.push({amount: amt, account: account})
    alert("Withdraw request submitted. Admin will process payment.")
    document.getElementById("withdrawAmount").value=""
    document.getElementById("withdrawAccount").value=""
    console.log("Pending Withdraws:", pendingWithdraws)
}

// Admin approves withdraw
function approveWithdraw(index){
    let wd = pendingWithdraws[index]
    balance -= wd.amount
    updateBalance()
    pendingWithdraws.splice(index,1)
    alert("Withdraw processed. New balance: "+balance)
}

// --------- Button Events ---------
document.getElementById("startBtn").onclick = startGame
document.getElementById("cashoutBtn").onclick = cashout

updateBalance()
})
