interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="restaurant-search">
      <span className="search-icon">⌕</span>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search restaurants or food"
        aria-label="Search restaurants or food"
      />

      <button
        type="button"
        className="filter-button"
        aria-label="Filter restaurants"
      >
        ⚙
      </button>
    </div>
  );
}

export default SearchBar;