# Building a Blockchain

### Need to add

1. Notify other nodes of minned blocks.
2. When notifying other nodes, add their network nodes to your network
3. Notify other nodes of new transactions
4. ...

### Route Calls

Mining A Block:

```bash
http://localhost:3000/mine_block
body = {
  minerAddress = xxx
}
```

Get The Chain:

```bash
http://localhost:3000/get_chain
body = { }
```

Replace Your Chain:

```bash
http://localhost:3000/replace_chain
body = { }
```

Add A Transaction:

```bash
http://localhost:3000/add_transaction
body = {
  privateKey = xxxxxxxxxx
  toAddress = public key goes here
  amount = 10
  contractCode? = "class Greeting {
      greeting;
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
    }"
  contractHash? = xxxxxxxxxx
  contractFunction? = setGreeting('Hey Joey!!!')
}
```

Call a Contract Function

```bash
http://localhost:3000/contract_function
body = {
  transactionHash = xxxxxxxxx
  func = getGreeting()
}
```

Get the Balance of A Wallet

```bash
http://localhost:3000/get_balance
body = {
  address = xxxxxxxxx
}
```
