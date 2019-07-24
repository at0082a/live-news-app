import React, { Component } from "react";
import Pusher from "pusher-js";
import pushid from "pushid";
import "./App.css";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = { newsItems: [], value: "", searchedItems: [] };
    this.handleChange = this.handleChange.bind(this);
    this.keyPress = this.keyPress.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  keyPress(e){
    if(e.keyCode === 13 ){
      return true;
    }
 }


  handleSubmit(event) {
    var topic = this.state.value;
    event.preventDefault();

    fetch("http://localhost:5000/api/search", {
      method: "POST",
      body: JSON.stringify({ firstParam: topic }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(articles => {
        this.setState({searchedItems: []});
        this.setState({
          searchedItems: [...this.state.searchedItems, ...articles]
        });
      });
  }

  componentDidMount() {
    fetch("http://localhost:5000/live")
      .then(response => response.json())
      .then(articles => {
        this.setState({
          newsItems: [...this.state.newsItems, ...articles]
        });
      })
      .catch(error => console.log(error));
    const pusher = new Pusher("7ebfc83d432373bb6d8c", {
      cluster: "us2",
      encrypted: true
    });
    const channel = pusher.subscribe("news-channel");
    channel.bind("update-news", data => {
      this.setState({
        newsItems: [...data.articles, ...this.state.newsItems]
      });
    });
  }
  render() {
    const NewsItem = (article, id) => (
      <li key={id}>
        <a href={`${article.url}`}>{article.title}</a>
        <p> {article.description} </p>
      </li>
    );

    const searchedItem = (article, id) => (
      <li key={id}>
        <a href={`${article.url}`}>{article.title}</a>
        <p> {article.description} </p>
      </li>
    );
    const newsItems = this.state.newsItems.map(e => NewsItem(e, pushid()));
    const searchedItems = this.state.searchedItems.map(e => searchedItem(e, pushid()));
    
    
    if (this.state.searchedItems.length === 0) {
    return (
      <div className="App">
        <h1 className="App-title">News Feed</h1>
        <form className="news-search" onSubmit={this.handleSubmit}>
          <input
            className="submit-button"
            type="text"
            onKeyDown={this.keyPress}
            onChange={this.handleChange}
            value={this.state.value}
          />
          <input className="submit-button" type="submit" value="Submit" />
        </form>
        <ul className="news-items">{newsItems}</ul>
      </div>
    );
  } else {
    return (
      <div className="App">
        <h1 className="App-title">News Feed</h1>
        <form className="news-search" onSubmit={this.handleSubmit}>
          <input
            className="submit-button"
            type="text"
            onKeyDown={this.keyPress}
            onChange={this.handleChange}
            value={this.state.value}
          />
          <input className="submit-button" type="submit" value="Submit" />
        </form>
        <ul className="news-items">{searchedItems}</ul>
      </div>
    );
  }
}
}
export default App;

