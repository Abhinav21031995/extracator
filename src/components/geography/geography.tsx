import React, { useState } from 'react';
import SearchBar from '../genericsearch/searchbar';
import GeographyTreeList from '../geography-tree-list/geography-tree-list';
import { GeographyNode } from '../../models/geography-tree';
import { MockGeographyHierarchyData } from '../../core/mock/data/mock-geography-data';
import './geography.css';

export interface GeographyProps {
  selectedGeographies?: string[];
  setSelectedGeographies?: React.Dispatch<React.SetStateAction<string[]>>;
}

const Geography: React.FC<GeographyProps> = ({
  selectedGeographies = [],
  setSelectedGeographies
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<GeographyNode[]>(MockGeographyHierarchyData);
  const [isSearching, setIsSearching] = useState(false);

  const handleFilteredDataChange = (filtered: GeographyNode[]) => {
    setFilteredData(filtered);
  };

  const handleSearchStateChange = (searching: boolean, query: string) => {
    setSearchQuery(query);
    setIsSearching(searching);
  };

  return (
    <div className="geography-container">
      <h1 className="geography-header"></h1>
      
      <SearchBar<GeographyNode>
        data={MockGeographyHierarchyData}
        onFilteredDataChange={handleFilteredDataChange}
        onSearchStateChange={handleSearchStateChange}
        placeholder="Search geographies..."
        searchField="geographyName"
        childrenField="geographies"
      />
      
      <GeographyTreeList
        data={filteredData}
        heading="Select Geographies"
        showSelectAllButton={true}
        selectedGeographies={selectedGeographies}
        setSelectedGeographies={setSelectedGeographies}
        isSearching={isSearching}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default Geography;