import "./App.css";
import { useState, useRef } from "react";

// move to secret keys in github
const API_KEY = "tr-DYbMJZg0xzEFCQKrGzBgbXaY8NPn85GN";
const DB_ID = "cacac1b3-d405-4e8e-bfd0-890e8a708ab4";

function SearchBar({ searchType, onSearch }) {
  const inputRef = useRef(null);

  const handleKeyUp = (event) => {
    if (event.key === "Enter") {
      inputRef.current.blur();
    }
    onSearch(searchType);
  };

  return (
    <div className="search-bar">
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder="Search thousands of books by title, author, or description"
        onKeyUp={handleKeyUp}
        autoFocus
      />
      <img
        className="search-button"
        alt="search"
        src={require("./search.png")}
        onClick={() => onSearch(searchType)}
      />
    </div>
  );
}

function ModeMenu({ onModeClick }) {
  return (
    <div className="mode-menu">
      Search Type:
      <div className="mode-content">
        <div
          className="mode-option semantic selected"
          onClick={() => onModeClick("semantic")}
        >
          Semantic
        </div>
        <div
          className="mode-option fulltext"
          onClick={() => onModeClick("fulltext")}
        >
          FullText
        </div>
        <div
          className="mode-option hybrid"
          onClick={() => onModeClick("hybrid")}
        >
          Hybrid
        </div>
      </div>
    </div>
  );
}

function SearchResults({ searchResults }) {
  function highlightText(text, highlights) {
    console.log(highlights);
    let highlightedText = text;
  
    highlights.forEach(highlight => {
      if (text.includes(highlight)) {
        const highlightRegex = new RegExp(`(${highlight})`, 'gi');
        highlightedText = highlightedText.replace(highlightRegex, `<span class="highlight">${highlight}</span>`);  
      }
    });
    return highlightedText;
  }

  const results = 
  [searchResults.map((result) => (
    <div key={result.metadata[0].id} className="search-result">
      <div className="search-image-holder">
        <img src={result.metadata[0].metadata["image_url"]} className="search-image"/>
      </div>
      <div className="search-result-content">
        <h3>{result.metadata[0].metadata.title}</h3>
        <h5>by {result.metadata[0].metadata.authors}</h5>
        <p dangerouslySetInnerHTML={{ __html: highlightText(result.metadata[0].metadata.overview, result.highlights) }} />
        {/* <p>{result.metadata[0].metadata.overview}</p> */}
      </div>
    </div>
  ))];
  return (
    <>
      <div className="search-results">
        {results}
        <div className="spacer"></div>
      </div>
    </>
  );
}

export default function App() {
  const [mode, setMode] = useState("semantic");
  const [searchResults, setSearchResults] = useState([]);

  function handleMode(searchType) {
    setMode(searchType);
    let modeOptions = Array.from(
      document.getElementsByClassName("mode-option")
    );
    modeOptions.forEach((option) => {
      option.classList.remove("selected");
    });
    document.querySelector("." + searchType).classList.add("selected");
    handleSearch(searchType);
  }

  async function fetchSearchResults(query, searchType) {
    const options = {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "TR-Dataset": DB_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        search_type: searchType,
      }),
    };

    try {
      const response = await fetch(
        "https://api.trieve.ai/api/chunk/search",
        options
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data)
      setSearchResults(data.score_chunks);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    }
  }

  async function handleSearch(searchType) {
    const searchText = document.querySelector(".search-input").value;
    await fetchSearchResults(searchText, searchType);
  }

  return (
    <div className="content">
      <div className="title">
        thrift<b>books</b> trieve search
      </div>
      <div className="description">Read more. Search less.</div>
      <SearchBar searchType={mode} onSearch={handleSearch} />
      <div className="mode-menu unselectable">
        <ModeMenu onModeClick={handleMode} />
      </div>
      <SearchResults searchResults={searchResults}/>
    </div>
  );
}

