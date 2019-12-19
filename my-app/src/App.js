import React, { Component } from "react";
import Pusher from "pusher-js";
import pushid from "pushid";
import "./App.css";
import  Navigation  from './components/navbar/navbar';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { newsItems: [], value: "", searchedItems: [] };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  //this function triggers when user wants to search for curated news topic
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
        <a target="_blank" href={`${article.url}`}>{article.title}</a>
        <p> {article.description} </p>
      </li>
    );

    const searchedItem = (article, id) => (
      <li key={id}>
        <a target="_blank" href={`${article.url}`} >{article.title}</a>
        <p> {article.description} </p>
      </li>
    );
    const newsItems = this.state.newsItems.map(e => NewsItem(e, pushid()));
    const searchedItems = this.state.searchedItems.map(e => searchedItem(e, pushid()));

    return (
      <div className="App">
        < Navigation sticky="top"/>
        <h1 className="App-title">My News Feed</h1>
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
        <div className="articles">
          { this.state.searchedItems.length === 0 
          ?
          <ul className="news-items">{newsItems}</ul> 
          :
          <ul className="news-items">{searchedItems}</ul>
          }
        </div>
      </div>
    );
  }
}
export default App;

