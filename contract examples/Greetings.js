class Greeting {
  greeting;
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
