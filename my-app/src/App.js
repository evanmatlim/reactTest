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
    onSearch(event.target.value);
  };

  return (
    <div className="search-input">
      <input 
        ref={inputRef}
        className="search-text" 
        type="text" 
        placeholder="Search..." 
        onKeyUp={handleKeyUp}
      />
    </div>
  );
}

function ModeMenu({ mode, onModeClick }) {
  const[isOpen, setIsOpen] = useState(false);

  function handleOpen(isOpen) {
    setIsOpen(isOpen);
  }

  let buttonDisplay, contentDisplay;

  if (isOpen) {
    buttonDisplay = "none";
    contentDisplay = "flex";
  } else {
    buttonDisplay = "flex";
    contentDisplay = "none";
  }

  return (
    <div className="dropdown">
      <button className="dropdown-button" style={{"display": buttonDisplay}} onClick={() => handleOpen(true)}>{ mode }</button>
      <div className="dropdown-content" style={{"display": contentDisplay}} >
        <div className="dropdown-option Semantic selected" onClick={() => {onModeClick("Semantic"); handleOpen(false)} }>Semantic</div>
        <div className="dropdown-option FullText" onClick={() => {onModeClick("FullText"); handleOpen(false)} }>FullText</div>
        <div className="dropdown-option Hybrid" onClick={() => {onModeClick("Hybrid"); handleOpen(false)} }>Hybrid</div>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("Semantic");
  const [searchResults, setSearchResults] = useState([]);

  function handleMode(mode) {
    setMode(mode);
    let dropdownOptions = Array.from(document.getElementsByClassName("dropdown-option"));
    dropdownOptions.forEach((option) => {
      option.classList.remove("selected");
    });
    document.querySelector("." + mode).classList.add("selected");
  }

  async function fetchSearchResults(query, searchType) {
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

  async function handleSearch(searchText) {
    // fetch results
    await fetchSearchResults(searchText, mode.toLowerCase());
  }

  return (
    <>
      <div className="title">title</div>
      <div className="description">description</div>
      <div className="search-bar">
        <SearchBar onSearch={handleSearch}/>
      </div>
      <div className="mode-menu">
        <ModeMenu mode={ mode } onModeClick={ handleMode } />
      </div>
      <div className="search-results">
        {searchResults.map(result => (
          <div key={result.id} className="search-result">
            <h3>{result.title}</h3>
            <p>{result.content}</p>
          </div>
        ))}
      </div>
    </>
  );
}


