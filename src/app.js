// const qrcode = window.qrcode
const video = document.createElement("video")
const qrCanvas = document.getElementById("qr-canvas")
const canvas = qrCanvas.getContext("2d")

const secWarning = document.getElementById("warning")
const secPreview = document.getElementById("preview")
const secDebug = document.getElementById("debug")
const container = document.getElementById("container")
const btnScanQR = document.getElementById("btn-scan-qr")
const btnFullScreen = document.getElementById("btn-fullscreen")

const dataName = document.getElementById("data-name")
const dataTaj = document.getElementById("data-taj")

const warning = x => {
  secWarning.innerText = x
  secWarning.style.display = 'block'
}

// QR kódból származó adat feldolgozása
// data => QR kód string
//
function processQRData(data) {
  try {
    dataStore.parse(data)
    dataName.innerText = `${dataStore.data.vNev} ${dataStore.data.kNev}`
    dataTaj.innerText = dataStore.data.taj
    secPreview.hidden = false
  } catch (e) {
    warning(e)
  }
}

let scanning = false

qrcode.callback = qrData => {
  if (qrData) {
    utf8txt = decodeURIComponent(escape(qrData));
    scanning = false
    processQRData(utf8txt)

    video.srcObject.getTracks()
      .forEach(track => { track.stop() })

    qrCanvas.hidden = true
    btnScanQR.hidden = false
  }
}

btnScanQR.onclick = async () => {
  if (!navigator.mediaDevices) {
    warning('Kamera nem érhető el. Töltse újra az alkalmazást és engedélyezze a kamerát!')
    return
  }

  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    })
  } catch {
    warning('Kamera hiba!')
  }

  scanning = true
  btnScanQR.hidden = true
  qrCanvas.hidden = false
  // required to tell iOS safari we don't want fullscreen
  video.setAttribute("playsinline", true)
  video.srcObject = stream
  video.play()
  tick()
  scan()
}

function tick() {
  qrCanvas.height = video.videoHeight
  qrCanvas.width = video.videoWidth
  canvas.drawImage(video, 0, 0, qrCanvas.width, qrCanvas.height)

  scanning && requestAnimationFrame(tick)
}

function scan() {
  try {
    qrcode.decode()
  } catch (e) {
    setTimeout(scan, 300)
  }
}

// Teljes képernyő kezelés, gombok kezelése 

const toggleFullScreen = elm => {
  if (!document.fullscreenElement) 
      elm.requestFullscreen()
  else
    if (document.exitFullscreen) 
      document.exitFullscreen()
}

btnFullScreen.onclick = () => toggleFullScreen(container)
secWarning.onclick = () => secWarning.style.display = 'none'
secDebug.onclick = () => secDebug.hidden = true

document.getElementById("btn-cancel").onclick = () => secPreview.hidden = true
document.getElementById("btn-send").onclick = () => {
  // TODO: dataStore.postData()
  secDebug.innerText = JSON.stringify(dataStore.data)
  secDebug.hidden = false
}

// Seviceworker 
// chrome alapú böngészők esetén kötelező PWA elem
if ('serviceWorker' in navigator) {
  // debug
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
   for(let registration of registrations) {
    registration.unregister()
  } })

  navigator.serviceWorker
    .register('sw.js')
    .then(() => { console.log('Service Worker registered.'); })
    .catch(e => { console.log('SW error', e); })
}

// Ha még nem fullscreen akkor (nem pwa módban vagyunk) legyen gomb
if(!window.matchMedia('(display-mode: fullscreen)').matches)
  btnFullScreen.style.display = 'block'

document.getElementById("btn-list").onclick = () => { 
  window.location = "https://github.com/goteguru/oltopont-qr-reader" 
}

const test="PATIONBETEG#012345678|Dr. Valami-Hosszú|Elsőnév Másodiknev|F|20100112|HUN|Kiskunfélegyháza|Hosszú-vezetéknév elsőnév másodiknév|HUN|1234|Kiskunfélegyháza|Valami nagyon nagyon nagyon hosszu utca 111/B|+36301234567|balazs.frey@gmail.com#P|1|Lorem ipsum dolor sit amet, consectetur adipiscing elit.|1|Lorem ipsum dolor sit amet, consectetur adipiscing elit.|0|1|Lorem ipsum dolor sit amet, consectetur adipiscing elit.|0|0|0|0|0|1|Lorem ipsum dolor sit amet, consectetur adipiscing elit.|0|0|0|0|0|1|Lorem ipsum dolor sit amet, consectetur adipiscing elit.|0|0|0"

dataStore.parse(test)
secDebug.innerText = JSON.stringify(dataStore.data)
console.log(dataStore)

// vim: set et sw=2 ts=2 :
