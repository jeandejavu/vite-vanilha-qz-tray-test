import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'
import { initQzTray, getPrinters, printTestPage, disconnectQzTray } from './qz-tray-service.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript + QZ Tray</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <div class="card">
      <button id="connect-qz" type="button">Connect to QZ Tray</button>
      <button id="get-printers" type="button" disabled>Get Printers</button>
      <div id="printer-list" class="printer-list"></div>
      <button id="disconnect-qz" type="button" disabled>Disconnect QZ Tray</button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

// QZ Tray functionality
const connectButton = document.querySelector<HTMLButtonElement>('#connect-qz')!
const getPrintersButton = document.querySelector<HTMLButtonElement>('#get-printers')!
const disconnectButton = document.querySelector<HTMLButtonElement>('#disconnect-qz')!
const printerListDiv = document.querySelector<HTMLDivElement>('#printer-list')!

// Connect to QZ Tray
connectButton.addEventListener('click', async () => {
  try {
    connectButton.disabled = true
    connectButton.textContent = 'Connecting...'
    
    await initQzTray()
    
    connectButton.textContent = 'Connected!'
    getPrintersButton.disabled = false
    disconnectButton.disabled = false
  } catch (error) {
    console.error('Failed to connect to QZ Tray:', error)
    connectButton.textContent = 'Connection Failed'
    setTimeout(() => {
      connectButton.textContent = 'Connect to QZ Tray'
      connectButton.disabled = false
    }, 3000)
  }
})

// Get list of printers
getPrintersButton.addEventListener('click', async () => {
  try {
    getPrintersButton.disabled = true
    getPrintersButton.textContent = 'Loading printers...'
    printerListDiv.innerHTML = ''
    
    const printers = await getPrinters()
    
    if (printers.length === 0) {
      printerListDiv.innerHTML = '<p>No printers found</p>'
    } else {
      const ul = document.createElement('ul')
      
      printers.forEach(printer => {
        const li = document.createElement('li')
        const printerText = document.createElement('span')
        printerText.textContent = printer
        
        const printButton = document.createElement('button')
        printButton.textContent = 'Print Test'
        printButton.className = 'print-test-btn'
        printButton.onclick = () => printTestPage(printer)
        
        li.appendChild(printerText)
        li.appendChild(printButton)
        ul.appendChild(li)
      })
      
      printerListDiv.appendChild(ul)
    }
    
    getPrintersButton.textContent = 'Refresh Printers'
    getPrintersButton.disabled = false
  } catch (error) {
    console.error('Failed to get printers:', error)
    printerListDiv.innerHTML = '<p>Error loading printers</p>'
    getPrintersButton.textContent = 'Get Printers'
    getPrintersButton.disabled = false
  }
})

// Disconnect from QZ Tray
disconnectButton.addEventListener('click', async () => {
  try {
    disconnectButton.disabled = true
    getPrintersButton.disabled = true
    disconnectButton.textContent = 'Disconnecting...'
    
    await disconnectQzTray()
    
    printerListDiv.innerHTML = ''
    connectButton.disabled = false
    connectButton.textContent = 'Connect to QZ Tray'
    disconnectButton.textContent = 'Disconnected'
    setTimeout(() => {
      disconnectButton.textContent = 'Disconnect QZ Tray'
    }, 2000)
  } catch (error) {
    console.error('Failed to disconnect from QZ Tray:', error)
    disconnectButton.textContent = 'Disconnect QZ Tray'
    disconnectButton.disabled = false
  }
})
