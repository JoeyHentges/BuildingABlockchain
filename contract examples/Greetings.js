class Greetings {
  #greeting;
  constructor() {
    this.#greeting = 'Hello world!';
  }
  setGreeting(greeting) {
    this.#greeting = greeting;
  }
  getGreeting() {
    return this.#greeting;
  }
}
