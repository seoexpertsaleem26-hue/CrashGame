document.addEventListener("DOMContentLoaded", function(){

// ----- Global -----
let users = JSON.parse(localStorage.getItem("users")) || []
let currentUser = null

// ----- DOM Elements -----
let signupSection = document.getElementById("signupSection")
let loginSection = document.getElementById("loginSection")
let walletSection = document.getElementById("walletSection")

let balanceEl = document.getElementById("balance")
let multiplierEl = document.getElementById("multiplier")
let resultEl = document.getElementById("result")
let historyList = document.getElementById("historyList")

let plane = document.getElementById("plane")
let planeX = 50
let planeY = 220
let canvas = document.getElementById("graph")
let ctx = canvas.getContext("2d")
let x=0

let cashSound = document.getElementById("cashSound")
let crashSound = document.getElementById("crashSound")

let running=false, multiplier=1, crashPoint=0, timer=null, betAmount=0

let pendingDeposits = []
let pendingWithdraws = []

// ----- Signup -----
document.getElementById("signupBtn").onclick = function(){
    let fullName = document.getElementById("signupFullName").value.trim()
    let username = document.getElementById("signupUsername").value.trim()
    let email = document.getElementById("signupEmail").value.trim()
    let password = document.getElementById("signupPassword").value.trim()
    if(!fullName || !username || !email || !password){ alert("Enter all details"); return }
    if(users.find(u=>u.username===username)){ alert("Username exists"); return }

    users.push({fullName, username, email, password, balance:0, history:[]})
    localStorage.setItem("users", JSON.stringify(users))
    alert("Account created! You can login now")
    signupSection.style.display="none"
    loginSection.style.display="block"
}

// ----- Login -----
document.getElementById("loginBtn").onclick = function(){
    let username = document.getElementById("loginUsername").value.trim()
    let password = document.getElementById("loginPassword").value.trim()
    let user = users.find(u=>u.username===username && u.password===password)
    if(!user){ alert("Wrong username/password"); return }
    currentUser = user
    loginSection.style.display="none"
    walletSection.style.display="block"
    updateWalletUI()
}

// ----- Update Wallet UI -----
function updateWalletUI(){
    balanceEl.innerText = "Balance: "+currentUser.balance.toFixed(2)
    historyList.innerHTML=""
    currentUser.history.forEach(h=>{
        let li=document.createElement("li")
        li.innerText=h
        historyList.appendChild(li)
    })
}

// ----- Game Functions -----
document.getElementById("startBtn").onclick = function(){
    if(running) return
    betAmount = parseFloat(document.getElementById("bet").value)
    if(!betAmount || betAmount<=0){ alert("Enter valid bet"); return }
    if(betAmount>currentUser.balance){ alert("Insufficient balance"); return }

    currentUser.balance -= betAmount
    saveUsers()

    multiplier=1
    running=true; x=0; planeX=50; planeY=220
    plane.style.left=planeX+"px"; plane.style.top=planeY+"px"

    crashPoint = Math.random()*5+1
    resultEl.innerText=""

    timer=setInterval(()=>{
        multiplier += 0.02
        multiplierEl.innerText = multiplier.toFixed(2)+"x"
        drawGraph()
        if(multiplier>=crashPoint){
            clearInterval(timer)
            running=false
            resultEl.innerText = "💥 Crashed at "+multiplier.toFixed(2)+"x"
            addHistory("Crash "+multiplier.toFixed(2)+"x")
            crashSound.play()
        }
    },50)
}

document.getElementById("cashoutBtn").onclick = function(){
    if(!running) return
    clearInterval(timer)
    running=false
    let win = betAmount*multiplier
    currentUser.balance += win
    addHistory("Win "+multiplier.toFixed(2)+"x")
    updateWalletUI()
    cashSound.play()
    saveUsers()
}

function drawGraph(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.beginPath()
    ctx.moveTo(0,200)
    ctx.quadraticCurveTo(x/2,200-(multiplier*10),x,200-(multiplier*20))
    ctx.strokeStyle="lime"; ctx.lineWidth=2; ctx.stroke()
    x+=4; planeX+=4; planeY-=0.5
    plane.style.left=planeX+"px"; plane.style.top=planeY+"px"
}

function addHistory(text){
    currentUser.history.push(text)
    saveUsers()
    updateWalletUI()
}

function saveUsers(){ localStorage.setItem("users", JSON.stringify(users)) }

// ----- Deposit -----
document.getElementById("depositBtn").onclick=function(){
    let amt=parseFloat(document.getElementById("depositAmount").value)
    let txn=document.getElementById("depositTxn").value.trim()
    if(!amt||amt<=0||!txn){ alert("Enter valid details"); return }
    pendingDeposits.push({user:currentUser.username,amount:amt,txnId:txn})
    alert("Deposit request sent to admin! Within 24 hours it will be verified")
    document.getElementById("depositAmount").value=""; document.getElementById("depositTxn").value=""
    saveUsers()
}

// ----- Withdraw -----
document.getElementById("withdrawBtn").onclick=function(){
    let amt=parseFloat(document.getElementById("withdrawAmount").value)
    let acc=document.getElementById("withdrawAccount").value.trim()
    if(!amt||amt<=0||!acc){ alert("Enter valid details"); return }
    if(amt>currentUser.balance){ alert("Insufficient balance"); return }
    pendingWithdraws.push({user:currentUser.username,amount:amt,account:acc})
    alert("Withdraw request sent to admin! Within 24 hours it will be approved")
    document.getElementById("withdrawAmount").value=""; document.getElementById("withdrawAccount").value=""
    saveUsers()
}

// ----- Admin Login -----
document.getElementById("adminLoginBtn").onclick=function(){
    let pass=document.getElementById("adminPass").value
    if(pass==="1234"){
        document.getElementById("adminPanel").style.display="block"
        alert("Admin logged in!")
        refreshAdminPanel()
    } else { alert("Wrong password!") }
}

// ----- Admin Functions -----
function refreshAdminPanel(){
    // Users
    let usersEl=document.getElementById("adminUsers")
    usersEl.innerHTML=""
    users.forEach(u=>{
        let li=document.createElement("li")
        li.innerText=`${u.username} - Balance: ${u.balance.toFixed(2)}`
        usersEl.appendChild(li)
    })
    // Pending Deposits
    let depEl=document.getElementById("adminDeposits")
    depEl.innerHTML=""
    pendingDeposits.forEach((d,i)=>{
        let li=document.createElement("li")
        li.innerHTML=`User: ${d.user} | Amount: ${d.amount} | Txn: ${d.txnId} <button class="verify" onclick="verifyDeposit(${i})">Verify</button>`
        depEl.appendChild(li)
    })
    // Pending Withdraws
    let wdEl=document.getElementById("adminWithdraws")
    wdEl.innerHTML=""
    pendingWithdraws.forEach((w,i)=>{
        let li=document.createElement("li")
        li.innerHTML=`User: ${w.user} | Amount: ${w.amount} | Account: ${w.account} <button class="approve" onclick="approveWithdraw(${i})">Approve</button>`
        wdEl.appendChild(li)
    })
}

// ----- Admin Verify/Approve -----
window.verifyDeposit=function(index){
    let d=pendingDeposits[index]
    let user=users.find(u=>u.username===d.user)
    if(user){ user.balance += d.amount; saveUsers() }
    pendingDeposits.splice(index,1)
    refreshAdminPanel()
}
window.approveWithdraw=function(index){
    let w=pendingWithdraws[index]
    let user=users.find(u=>u.username===w.user)
    if(user){ user.balance -= w.amount; saveUsers() }
    pendingWithdraws.splice(index,1)
    refreshAdminPanel()
}

}) // DOMContentLoaded
