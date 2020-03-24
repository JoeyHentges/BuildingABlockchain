class People {
  constructor() {
    this.people = [];
  }
  applyParameters(people) {
    this.people = people ? people : this.people;
  }
  addPerson(person) {
    if (person) { this.people.push(person); }
  }
  getPersonByIndex(index) {
    return this.people[index];
  }
  getPeople() {
    return this.people;
  }
}
