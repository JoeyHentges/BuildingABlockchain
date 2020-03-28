class Greeting {
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

class Greeting {
  constructor() {
    this.greeting = 'Hello World!';
  }
  applyParameters(greeting) {
    this.greeting = greeting;
  }
  setGreeting(greeting) {
    this.greeting = greeting;
  }
  getGreeting() {
    return this.greeting;
  }
}
