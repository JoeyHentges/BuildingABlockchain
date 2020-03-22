class People {
  #people;
  constructor() {
    this.#people = [];
  }
  addPerson(person) {
    this.#people.push(person);
  }
  getPersonByIndex(index) {
    return this.#people[index];
  }
  getPeople() {
    return this.#people;
  }
}
