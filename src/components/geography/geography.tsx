import React, { useEffect, useState } from 'react';
import { GeographyNode } from '../../models/geography-tree';
import { MockGeographyHierarchyData } from '../../core/mock/data/mock-geography-data';
import TreeList from '../tree-list/tree-list';
import SearchBar from '../genericsearch/searchbar';
import './geography.css';

export interface GeographyProps {
  selectedGeographies?: string[];
  setSelectedGeographies?: React.Dispatch<React.SetStateAction<string[]>>;
}

const Geography: React.FC<GeographyProps> = ({
  selectedGeographies = [],
  setSelectedGeographies
}) => {
  const [dataSource, setDataSource] = useState<GeographyNode[]>([]);
  const [filteredData, setFilteredData] = useState<GeographyNode[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setDataSource(MockGeographyHierarchyData);
    setFilteredData(MockGeographyHierarchyData);
  }, []);

  const handleFilteredDataChange = (filtered: GeographyNode[]) => {
    setFilteredData(filtered);
  };

  const handleSearchStateChange = (searching: boolean, query: string) => {
    setIsSearching(searching);
    setSearchQuery(query);
  };

  return (
    <div className="geography-container">
      <SearchBar<GeographyNode>
        data={dataSource}
        onFilteredDataChange={handleFilteredDataChange}
        onSearchStateChange={handleSearchStateChange}
        placeholder="Search geographies..."
        searchField="geographyName"
        childrenField="geographies"
        minSearchLength={1}
        className="geography-search-container"
      />
      <TreeList
        data={filteredData}
        heading="Select Geographies"
        showSelectAllButton={true}
        selectedGeographies={selectedGeographies}
        setSelectedGeographies={setSelectedGeographies}
        isSearching={isSearching}
        searchQuery={searchQuery}
        initiallyExpanded={false}
        nodeType="geography"
      />
    </div>
  );
};

export default Geography;
