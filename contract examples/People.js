class People {
  constructor() {
    this.people = [];
  }
  applyParameters(people) {
    this.people = people ? people : this.people;
  }
  addPerson(person) {
    if (person) {
      this.people.push(person);
    }
  }
  getPersonByIndex(index) {
    return this.people[index];
  }
  getPeople() {
    return this.people;
  }
}

class People {
  constructor() {
    this.people = [];
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

class People {
  constructor() {
    this.people = [];
  }
  applyParameters(people) {
    this.people = people;
  }
  addPerson(person) {
    this.people.push(person);
  }
  getPersonByIndex(index) {
    //return this.people[index];
    for (let i = 0; i < this.people.length; i += 1) {
      if (i == index) {
        return this.people[i];
        this.people = [];
      }
    }
  }
  getPeople() {
    return this.people;
  }
}
