class Article {
  constructor() {
    this.articles = [];
  }
  applyParameters(articles) {
    this.artciles = artciles ? articles : this.artciles;
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
}

const articles = new Article();
articles.addArticle('Test1', 'Joseph', 'this is a test', ['test', 'test2']);
console.log(articles.getArticles());
console.log(articles.setArticleAuthorByTitle('Test1', 'Tommy'));
console.log(articles.getArticles());
