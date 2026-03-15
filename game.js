document.addEventListener("DOMContentLoaded", function(){

  // Variables
  let balance = localStorage.getItem("balance") || 1000
  let multiplier = 1
  let crashPoint = 0
  let running = false
  let timer
  let betAmount = 0

  // Plane
  let plane = document.getElementById("plane")
  let planeX = 50
  let planeY = 220

  // Sounds
  let cashSound = document.getElementById("cashSound")
  let crashSound = document.getElementById("crashSound")

  // Canvas
  let canvas = document.getElementById("graph")
  let ctx = canvas.getContext("2d")
  let x = 0

  function updateBalance(){
      document.getElementById("balance").innerText = "Balance: " + balance
      localStorage.setItem("balance", balance)
  }

  function startGame(){
      if(running) return

      betAmount = parseFloat(document.getElementById("bet").value)
      if(!betAmount || betAmount <=0){
          alert("Enter bet amount")
          return
      }

      if(betAmount>balance){
          alert("Not enough balance")
          return
      }

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

          document.getElementById("multiplier").innerHTML = multiplier.toFixed(2) + "x"

          drawGraph()

          if(multiplier >= crashPoint){
              clearInterval(timer)
              running = false
              document.getElementById("result").innerHTML = "💥 Crashed at " + multiplier.toFixed(2) + "x"
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

      // Plane movement
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

  // Button events
  document.getElementById("startBtn").onclick = startGame
  document.getElementById("cashoutBtn").onclick = cashout

  updateBalance()
})
