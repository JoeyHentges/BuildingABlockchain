# Building a Blockchain

### Need to add

1. Notify other nodes of minned blocks.
1. When notifying other nodes, add their network nodes to your network
1. Notify other nodes of new transactions
1. ...

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
}
```

Add a Contract

```bash
http://localhost:3000/add_contract
body = {
  privateKey = xxxxxxxxxx
  toAddress = public key goes here
  amount = 10
  contractCode = "class Article {
      constructor() {
        this.articles = [];
      }
      addArticle(title, author, contents, tags) {
        const article = {
          title,
          author,
          contents,
          tags
        };
        this.articles.push(article);
      }
      getArticles() {
        return this.articles;
      }
      getArticleByTitle(title) {
        for (const article of this.articles) {
          if (article.title === title) {
            return article;
          }
        }
        return null;
      }
      getArticlesByAuthor(author) {
        const articles = [];
        for (let i = 0; i < this.articles.length; i += 1) {
          if (this.articles[i].author === author) {
            articles.push(this.articles[i]);
          }
        }
        return articles;
      }
      setArticleAuthorByTitle(title, author) {
        for (const article of this.articles) {
          if (article.title === title) {
            article.author = author;
          }
        }
      }
    }"
  contractFunctionsSchema = {
      "addArticle": true,
      "getArticles": false,
      "getArticleByTitle": false,
      "getArticlesByAuthor": false,
      "setArticleAuthorByTitle": true
    }
}
```

Set a Value in a Contract

```bash
http://localhost:3000/contract_set
body = {
  privateKey = xxxxxxxxxx
  toAddress = public key goes here
  amount = 10
  contractHash = xxxxxxxxxx
  contractFunction = setGreeting('Hey Joey!!!')
}
```

Call a Contract Function

```bash
http://localhost:3000/contract_get
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
