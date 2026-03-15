/ ===== Users & Admin =====
let users = {}; // {username:{pass,balance,history,active}}
let currentUser = null;
let pendingDeposits = [];
let pendingWithdraws = [];

// ===== DOM Elements =====
const loginPage = document.getElementById("loginPage");
const walletPage = document.getElementById("walletPage");
const gamePage = document.getElementById("gamePage");
const balanceEl = document.getElementById("balance");
const resultEl = document.getElementById("result");
const historyList = document.getElementById("historyList");
const allUsersList = document.getElementById("allUsersList");
const adminPanel = document.getElementById("adminPanel");
const adminContent = document.getElementById("adminContent");

// ===== Sounds =====
const cashSound = document.getElementById("cashSound");
const crashSound = document.getElementById("crashSound");

// ===== Game Variables =====
let multiplier=1, crashPoint=0, running=false, timer, betAmount=0;
let plane=document.getElementById("plane"), planeX=50, planeY=220;
let canvas=document.getElementById("graph"), ctx=canvas.getContext("2d"), x=0;

// ===== Signup/Login =====
document.getElementById("signupBtn").onclick=function(){
    let user=document.getElementById("username").value.trim();
    let pass=document.getElementById("userPass").value.trim();
    if(!user || !pass){alert("Enter username & password"); return;}
    if(users[user]){alert("User exists!"); return;}
    users[user]={pass:pass,balance:0,history:[],active:false};
    alert("Signup successful!");
}
document.getElementById("loginBtn").onclick=function(){
    let user=document.getElementById("username").value.trim();
    let pass=document.getElementById("userPass").value.trim();
    if(!users[user] || users[user].pass!==pass){alert("Invalid credentials"); return;}
    currentUser=user;
    users[user].active=true;
    loginPage.style.display="none";
    walletPage.style.display="block";
    gamePage.style.display="block";
    updateBalance();
    refreshHistory();
    refreshAdminDashboard();
}

// ===== Update Balance & History =====
function updateBalance(){balanceEl.innerText=users[currentUser].balance.toFixed(2);}
function refreshHistory(){
    historyList.innerHTML="";
    users[currentUser].history.slice().reverse().forEach(h=>{
        let li=document.createElement("li"); li.innerText=h; historyList.appendChild(li);
    });
}

// ===== Deposit/Withdraw =====
function depositRequest(){
    let amt=parseFloat(document.getElementById("depositAmount").value);
    let txn=document.getElementById("depositTxn").value.trim();
    if(!amt || amt<=0 || !txn){alert("Invalid input"); return;}
    pendingDeposits.push({username:currentUser,amount:amt,txnId:txn});
    alert("Your deposit request sent to admin. Within 24 hrs balance will be added. Thanks!");
    document.getElementById("depositAmount").value="";
    document.getElementById("depositTxn").value="";
    refreshAdminDashboard();
}
function withdrawRequest(){
    let amt=parseFloat(document.getElementById("withdrawAmount").value);
    let account=document.getElementById("withdrawAccount").value.trim();
    if(!amt || amt<=0){alert("Invalid input"); return;}
    if(amt>users[currentUser].balance){alert("Insufficient balance"); return;}
    if(!account){alert("Enter account"); return;}
    pendingWithdraws.push({username:currentUser,amount:amt,account:account});
    alert("Your withdraw request sent to admin. Within 24 hrs it will be approved!");
    document.getElementById("withdrawAmount").value="";
    document.getElementById("withdrawAccount").value="";
    refreshAdminDashboard();
}

// ===== Game Functions =====
document.getElementById("startBtn").onclick=startGame;
document.getElementById("cashoutBtn").onclick=cashout;

function startGame(){
    if(running){alert("Game running"); return;}
    betAmount=parseFloat(document.getElementById("bet").value);
    if(!betAmount || betAmount<=0 || betAmount>users[currentUser].balance){alert("Invalid bet"); return;}
    users[currentUser].balance-=betAmount; updateBalance();
    multiplier=1; running=true; x=0; planeX=50; planeY=220; plane.style.left="50px"; plane.style.top="220px";
    crashPoint=Math.random()*5+1; resultEl.innerText="";
    timer=setInterval(()=>{
        multiplier+=0.02; document.getElementById("multiplier").innerText=multiplier.toFixed(2)+"x";
        drawGraph();
        if(multiplier>=crashPoint){clearInterval(timer); running=false;
            resultEl.innerText="💥 Crashed at "+multiplier.toFixed(2)+"x";
            users[currentUser].history.push("Crash "+multiplier.toFixed(2)+"x"); refreshHistory();
            crashSound.play();
        }
    },50);
}
function cashout(){
    if(!running){alert("No game running"); return;}
    clearInterval(timer); running=false;
    let win=betAmount*multiplier;
    users[currentUser].balance+=win; updateBalance();
    resultEl.innerText="✅ Won "+win.toFixed(2);
    users[currentUser].history.push("Win "+multiplier.toFixed(2)+"x"); refreshHistory();
    cashSound.play();
}
function drawGraph(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.beginPath(); ctx.moveTo(0,200);
    ctx.quadraticCurveTo(x/2,200-(multiplier*10),x,200-(multiplier*20));
    ctx.strokeStyle="lime"; ctx.lineWidth=2; ctx.stroke();
    x+=4; planeX+=4; planeY-=0.5; plane.style.left=planeX+"px"; plane.style.top=planeY+"px";
}

// ===== Admin Login =====
document.getElementById("adminLoginBtn").onclick=function(){
    let pass=document.getElementById("adminPass").value;
    if(pass==="1234"){adminContent.style.display="block"; alert("Admin logged in!"); refreshAdminDashboard();} 
    else{alert("Wrong password!");}
}

// ===== Admin Dashboard =====
function refreshAdminDashboard(){
    // All Users
    allUsersList.innerHTML="";
    for(let u in users){
        let li=document.createElement("li"); 
        li.innerText=u+" | Balance: "+users[u].balance.toFixed(2)+" | Active: "+(users[u].active?"Yes":"No");
        allUsersList.appendChild(li);
    }
    // Pending Deposits
    let depList=document.getElementById("adminDeposits"); depList.innerHTML="";
    pendingDeposits.forEach((d,i)=>{
        let li=document.createElement("li");
        li.innerHTML=`${d.username} | Amount: ${d.amount} | TxnID: ${d.txnId} <button class="verify" onclick="verifyDeposit(${i})">Verify</button>`;
        depList.appendChild(li);
    });
    // Pending Withdraws
    let wdList=document.getElementById("adminWithdraws"); wdList.innerHTML="";
    pendingWithdraws.forEach((w,i)=>{
        let li=document.createElement("li");
        li.innerHTML=`${w.username} | Amount: ${w.amount} | Account: ${w.account} <button class="approve" onclick="approveWithdraw(${i})">Approve</button>`;
        wdList.appendChild(li);
    });
}
function verifyDeposit(index){
    let d=pendingDeposits[index];
    users[d.username].balance+=d.amount; if(d.username===currentUser) updateBalance();
    pendingDeposits.splice(index,1); refreshAdminDashboard();
}
function approveWithdraw(index){
    let w=pendingWithdraws[index];
    users[w.username].balance-=w.amount; if(w.username===currentUser) updateBalance();
    pendingWithdraws.splice(index,1); refreshAdminDashboard();
}
