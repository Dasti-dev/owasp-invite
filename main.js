const Controller = require('./src/controller.js')
const Terminal = require('terminal.js')

let termContainer = document.getElementById('terminaljs')
let term = new Terminal({columns: 80, row: 24})

let controller = new Controller(term, termContainer)
controller.run()

window.onload = function () {
  document.getElementById('terminaljs').focus()
}
