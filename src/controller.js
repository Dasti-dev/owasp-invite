const Stream = require('stream');

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let HACK_ON = `
  _____ ______ ______ ______   _____   _____ _____ _____ _______ 
 |_   _|  ____|  ____|  ____| |  __ \ / ____|_   _|  __ \__   __|
   | | | |__  | |__  | |__    | |__) | |  __  | | | |__) | | |   
   | | |  __| |  __| |  __|   |  _  /| | |_ | | | |  ___/  | |   
  _| |_| |____| |____| |____  | | \ \| |__| |_| |_| |      | |   
 |_____|______|______|______| |_|  \_\\_____|_____|_|      |_|   
                                                                 
                                                                  
                                                                                                                   
`;

class Controller {

  constructor(term, termContainer) {
    // State
    this.printing = true; // If the this is writing, don't allow user input
    this.currentBuffer = ""; // This is the current user input.
    this.capturePromiseResolve = null;
    this.captureInputType = ""; // will be set to the input we are accepting
    this.inputValidator = null;

    // Storage
    this.capturedValues = {};

    this.hackOn = HACK_ON;

    // Setup terminal loop
    this.term = term;
    this.dest = new Stream({decodeStrings: false, encoding: 'utf-8'});
    this.dest.writable = true;
    this.term.dom(termContainer).pipe(this.dest);

    // Bind methods to `this`
    this.dest.write = this.handleCharacter.bind(this);
    this.captureInput = this.captureInput.bind(this);
  }

  handleCharacter(data) {
    if (this.printing) {
      console.trace('In writing state, ignoring character');
      return;
    }

    if (data.length === 1 && data[0] === 127) {
      if(this.currentBuffer.length > 0) {
        this.term.write('\b');
        this.term.state.removeChar(1);
        this.currentBuffer =  this.currentBuffer.slice(0, -1);
      }
      return;
    }

    if (data.length === 1 && data[0] === 13 && this.currentBuffer.length != 0) {
        // Finish the writing session
        this.printing = true;
        // Add a new line
        this.addNewLine();
        let capturedInput = this.currentBuffer;
        this.currentBuffer = "";
        this.capturePromiseResolve(capturedInput);
    }

    var isValid = true;

    for( var i = 0; i < data.length; i++) {
      if(data[i] < 32 || data[i] > 125) {
        isValid = false;
        break;
      }
    }
    if(isValid) {
      this.term.write(data);
      this.currentBuffer += data.toString();
    }

  }

  addNewLine() {
    this.term.state.setCursor(0, this.term.state.cursor.y + 1);
    this.term.state.insertLine();
  }

  async captureInput() {
    this.printing = false;
    return new Promise((resolve) => {
      this.capturePromiseResolve = resolve;
    });
  }

  async captureValidatedInput(inputType, validator) {
    while (true) {
      this.printing = false;
      let capturedInput = await new Promise((resolve) => {
        this.capturePromiseResolve = resolve;
      });
      let errorMessage = validator(capturedInput);
      if (errorMessage === null) {
        this.capturedValues[inputType] = capturedInput;
        return;
      }
      await this.typeString(errorMessage);
      this.addNewLine();
    }
  }

  async typeCharacter(character, done, speed) {
    this.term.write(character);
    await timeout(speed);
  }

  async typeString(buffer) {
    // This will write to the terminal with a certain speed
    for (var i = 0; i < buffer.length; i++) {
      await this.typeCharacter(buffer[i], null, 50)
    }
  }

  async typeHackOn() {
    for (var i = 0; i < this.hackOn.length; i++) {
      if(this.hackOn[i] === '\n') {
        this.addNewLine()
      } else {
        await this.typeCharacter(this.hackOn[i], null, 0);
      }
    }
    this.addNewLine()
  }

  async sendAttendeeData() {
    let response = await fetch('/attendees', {  // http://localhost:3000/attendees
      headers: {"Content-Type": 'application/json'},
      method: 'post',
      body: JSON.stringify(this.capturedValues)
    });
  }

  run() {
    (async ()=> {
      await this.typeString("Welcome, You are invited to come to our Orientation program on 8th April, 2022, in AB1-LR1 at 6:30 PM. ")
      await timeout(250);
      this.addNewLine();
      await this.typeString("Amazing Speakers. ");
      await timeout(250);
      await this.typeString("Inspiring Projects. ");
      await timeout(250);
      await this.typeString("Hackers ;). ");
      await timeout(250);
      await this.typeString("Prize Distribution, Free Merchandise kit with IEEE membership and High Tea Arrangement.");
      await timeout(250);
      this.addNewLine();
      this.addNewLine();
      await this.typeString("You down? ");
      await timeout(250);
      this.addNewLine();
      await this.typeString("We'll await your presence :D.");
      this.addNewLine();
      this.addNewLine();
      await this.typeHackOn();
      this.addNewLine();
      await timeout(250);
      await this.typeString(";");
      await timeout(100);
      await this.typeString(")");
      this.addNewLine();
      await timeout(20000);
      await this.typeString("You\'re still here? Might want to view the page source...");
      this.addNewLine();
      await timeout(1);
      await this.typeString("???: ");
      await this.captureValidatedInput("md5", (input) => {
        if(input === '000242dc7a5257e1f265578cdcc6c3fd') {
          return null;
        } else {
          return "???: ";
        }
      });

      // take input and check for equality to '000242dc7a5257e1f265578cdcc6c3fd'
      this.addNewLine();
      await this.typeString("You were added to the list \"TOP SECRET\". We\'ll be in touch soon. Viva La IEEE.")
      // write to output.txt/csv on server-side
      this.sendAttendeeData();  // resend attendee data if they get secret
      return;
    })()
  }
}

module.exports = Controller;
