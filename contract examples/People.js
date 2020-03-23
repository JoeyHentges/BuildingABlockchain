class People {
  people;
  constructor(people = []) {
    this.people = people;
  }
  applyParameters(people) {
    this.people = people;
  }
  addPerson(person) {
    this.people.push(person);
  }
  getPersonByIndex(index) {
    return this.people[index];
  }
  getPeople() {
    return this.people;
  }
}
