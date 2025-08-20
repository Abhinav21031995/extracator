import React, { useState, useEffect } from 'react';
import './searchbar.css';

export interface SearchableItem {
  [key: string]: any;
}

export interface SearchBarProps<T extends SearchableItem> {
  data: T[];
  onFilteredDataChange: (filteredData: T[]) => void;
  onSearchStateChange?: (isSearching: boolean, query: string) => void;
  placeholder?: string;
  searchField: keyof T | ((item: T) => string);
  childrenField?: keyof T;
  minSearchLength?: number;
  className?: string;
  debounceMs?: number;
}

function SearchBarComponent<T extends SearchableItem>({
  data,
  onFilteredDataChange,
  onSearchStateChange,
  placeholder = "Search...",
  searchField,
  childrenField,
  minSearchLength = 3,
  className = "generic-search-container",
  debounceMs = 300
}: SearchBarProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Handle search filtering
  useEffect(() => {
    const query = debouncedQuery.trim().toLowerCase();
    const isSearching = query.length >= minSearchLength;

    if (query.length < minSearchLength) {
      onFilteredDataChange([...data]);
      onSearchStateChange?.(false, '');
    } else {
      const filteredResults = filterItems(data, query);
      onFilteredDataChange(filteredResults);
      onSearchStateChange?.(true, query);
    }
  }, [debouncedQuery, data, minSearchLength, onFilteredDataChange, onSearchStateChange]);

  // Get the searchable text from an item
  const getSearchableText = (item: T): string => {
    if (typeof searchField === 'function') {
      return searchField(item);
    }
    return String(item[searchField] || '');
  };

  // Recursive filter function for hierarchical data
  const filterItems = (items: T[], query: string): T[] => {
    return items
      .map((item) => {
        const itemText = getSearchableText(item).toLowerCase();
        const isDirectMatch = itemText.includes(query);
        
        let filteredChildren: T[] = [];
        if (childrenField && Array.isArray(item[childrenField])) {
          filteredChildren = filterItems(item[childrenField] as T[], query);
        }
        
        // Include item if it matches directly or has matching children
        if (isDirectMatch || filteredChildren.length > 0) {
          const resultItem = childrenField && Array.isArray(item[childrenField])
            ? { 
                ...item, 
                [childrenField]: filteredChildren,
                // Add metadata for highlighting and expansion
                _isDirectMatch: isDirectMatch,
                _hasMatchingChildren: filteredChildren.length > 0,
                _searchQuery: query
              }
            : { 
                ...item,
                _isDirectMatch: isDirectMatch,
                _searchQuery: query
              };
          
          return resultItem;
        }
        
        return null;
      })
      .filter(Boolean) as T[];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    onSearchStateChange?.(false, '');
  };

  return (
    <div className={className}>
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          className="generic-search-input"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="search-clear-btn"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <div className="search-icon">
          🔍
        </div>
      </div>
      {debouncedQuery && debouncedQuery.length > 0 && debouncedQuery.length < minSearchLength && (
        <div className="search-hint">
          Type at least {minSearchLength} characters to search
        </div>
      )}
    </div>
  );
}

const SearchBar = React.memo(SearchBarComponent) as typeof SearchBarComponent;
export default SearchBar;
