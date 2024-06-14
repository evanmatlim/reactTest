import './App.css';
import { useState, useRef } from 'react';


// move to secret keys in github
const API_KEY = 'tr-J7kRNSBIeuhovTGYu7rhPWxK9N4KtWXJ';
const DB_ID = 'ec4117c0-0af7-4edd-9eb4-99fa46c4590c';
const ORG_ID = "d8be229a-5116-4b28-ade5-da13199cd3fb";


function SearchBar({ searchType, onSearch }) {
  const inputRef = useRef(null);

  const handleKeyUp = (event) => {
    if (event.key === 'Enter') {
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
      <img className="search-button" src={ require('./search.png')} onClick={() => onSearch(searchType)}/>
    </div>
  );
}

function ModeMenu({ onModeClick }) {
  return (
    <div className="mode-menu">
      Search Type:
      <div className="mode-content">
        <div className="mode-option semantic selected" onClick={() => onModeClick("semantic") }>Semantic</div>
        <div className="mode-option fulltext" onClick={() => onModeClick("fulltext") }>FullText</div>
        <div className="mode-option hybrid" onClick={() => onModeClick("hybrid") }>Hybrid</div>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("semantic");
  const [searchResults, setSearchResults] = useState([]);

  function handleMode(searchType) {
    setMode(searchType);
    let modeOptions = Array.from(document.getElementsByClassName("mode-option"));
    modeOptions.forEach((option) => {
      option.classList.remove("selected");
    });
    document.querySelector("." + searchType).classList.add("selected");
    handleSearch(searchType);
  }

  async function fetchSearchResults(query, searchType) {
    console.log(`searching for: "${query}" with search type: "${searchType}"`)
    const options = {
      method: 'POST',
      headers: {
        Authorization: API_KEY,
        'TR-Dataset': DB_ID,
        "TR-Organization": ORG_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date_bias: true,
        page: 1,
        page_size: 10,
        query: query,
        score_threshold: 0.5,
        search_type: searchType,
        use_weights: true
      }),
    };
    console.log(options);
    try {
      const response = await fetch('https://api.trieve.ai/api/chunk/search', options);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log(data);
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    }
  }

  async function handleSearch(searchType) {
    const searchText = document.querySelector(".search-input").value;
    await fetchSearchResults(searchText, searchType);
  }

  return (
    <div className="content">
      <div className="title">thrift<b>books</b> trieve search</div>
      <div className="description">Read more. Search less.</div>
      <SearchBar searchType={mode} onSearch={handleSearch}/>
      <div className="mode-menu unselectable">
        <ModeMenu onModeClick={ handleMode } />
      </div>
      <div className="search-results">
        {searchResults.map(result => (
          <div key={result.id} className="search-result">
            <h3>{result.title}</h3>
            <p>{result.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


