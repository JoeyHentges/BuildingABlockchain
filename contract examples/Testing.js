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

const getMethods = obj => {
  const predefinedFunctions = [
    'constructor',
    '__defineGetter__',
    '__defineSetter__',
    'hasOwnProperty',
    '__lookupGetter__',
    '__lookupSetter__',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toString',
    'valueOf',
    'toLocaleString'
  ];
  let properties = new Set();
  let currentObj = obj;
  do {
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
  } while ((currentObj = Object.getPrototypeOf(currentObj)));
  return [...properties.keys()]
    .filter(item => typeof obj[item] === 'function')
    .filter(item => !predefinedFunctions.includes(item));
};

function getAllFunctions() {
  var allfunctions = [];
  for (var i in window) {
    if ((typeof window[i]).toString() == 'function') {
      allfunctions.push(window[i].name);
    }
  }
}

let temp = new Greeting();
temp = new People();

const methods = getMethods(temp);
let classText = `class Greeting {
  constructor() {
    this.greeting = 'Hello World!';
  }
  applyParameters(greeting) {
    this.greeting = greeting ? greeting : this.greeting;
  }
  setGreeting(greeting) {
    this.greeting = greeting ? greeting : this.greeting;
    greeting = greeting ? greeting : this.greeting;
  }
  getGreeting() {
    return this.greeting;
  }
}`;

classText = `class People {
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
}`;

const getFunctionInsideCurly = functionSplit => {
  let curlyBraceCount = 0;
  for (let i = 1; i < functionSplit.length; i += 1) {
    if (!functionSplit[i].includes('}')) {
      curlyBraceCount += 1;
    }
  }
  let newStr = '';
  for (let i = 1; i < curlyBraceCount + 2; i += 1) {
    newStr += functionSplit[i];
  }
  return newStr;
};

const checkForAssignment = (classText, methods) => {
  const arrayMutators = ['push', 'pop', 'unshift', 'shift', 'splice'];

  const funcAssigns = {};
  for (const method of methods) {
    funcAssigns[method] = false;
    console.log('method', method);
    const newLine = getFunctionInsideCurly(
      classText.split(method)[1].split('{')
    );
    const lineSplits = classText
      .split(method)[1]
      .split('{')[1]
      .split('}')[0]
      .split(';');
    const lineSplit = getFunctionInsideCurly(
      classText.split(method)[1].split('{')
    )
      .split('}')[0]
      .split(';');
    console.log(lineSplit);
    for (const line of lineSplit) {
      if (line.includes('//')) {
        console.log('comoment');
        continue;
      }
      const equalSplit = line.split('=');
      if (equalSplit.length > 1) {
        console.log('contains assignment');
        for (let i = 0; i < equalSplit.length; i += 1) {
          if (i % 2 == 0) {
            if (equalSplit[i].includes('this.')) {
              console.log('assigning class var');
              funcAssigns[method] = true;
            }
          }
        }
      } else {
        if (line.includes('this.')) {
          for (const mutator of arrayMutators) {
            if (line.includes(`.${mutator}(`)) {
              console.log('array changing class var');
              funcAssigns[method] = true;
            }
          }
          console.log('possible assigning class var');
        }
        console.log('doesnt contain assignment');
      }
    }
    console.log('\n\n');
  }
  return funcAssigns;
};

console.log(checkForAssignment(classText, methods));
