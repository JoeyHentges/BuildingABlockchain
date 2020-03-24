class Greeting {
  greeting;
  constructor() {
    this.greeting = 'Hello World!';
  }
  applyParameters(greeting) {
    this.greeting = greeting ? greeting : this.greeting;
  }
  setGreeting(greeting) {
    this.greeting = greeting ? greeting : this.greeting;
  }
  getGreeting() {
    return this.greeting;
  }
}

const temp = new Greeting();
temp.setGreeting();
console.log(temp);
