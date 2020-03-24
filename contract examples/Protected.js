class Greeting {
  greeting;
  constructor() {
    this.greeting = 'Hello World!';
  }
  set applyParameters(greeting = greeting) {
    this.greeting = greeting;
  }
  set setGreeting(greeting = greeting) {
    this.greeting = greeting;
  }
  get getGreeting() {
    return this.greeting;
  }
}
