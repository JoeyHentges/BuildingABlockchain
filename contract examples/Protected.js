class Protected {
  protectedKey = 'pass1234';
  firstName;
  lastName;
  constructor() {
    this.firstName = 'Joey';
    this.lastName = 'Hentges';
  }
  applyParameters(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
