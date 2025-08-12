import React, { useEffect, useState } from 'react';
import { CategoryNode } from '../../models/category-tree';
import { MockCategoryHierarchyData } from '../../core/mock/data/mock-category-data';
import TreeList from '../tree-list/tree-list';
import SearchBar from '../genericsearch/searchbar';

interface CategoryProps {
  heading?: string;
  showSelectAllButton?: boolean;
  selectedCategories?: string[];
  setSelectedCategories?: React.Dispatch<React.SetStateAction<string[]>>;
}

const Category= (props: CategoryProps) => {
  const { heading = 'Select Categories', showSelectAllButton = true, selectedCategories, setSelectedCategories } = props;
  const [dataSource, setDataSource] = useState<CategoryNode[]>([]);
  const [filteredData, setFilteredData] = useState<CategoryNode[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setDataSource(MockCategoryHierarchyData);
    setFilteredData(MockCategoryHierarchyData);
  }, []);

  const handleFilteredDataChange = (filtered: CategoryNode[]) => {
    setFilteredData(filtered);
  };

  const handleSearchStateChange = (searching: boolean, query: string) => {
    setIsSearching(searching);
    setSearchQuery(query);
  };

  return (
    <div>
      <SearchBar<CategoryNode>
        data={dataSource}
        onFilteredDataChange={handleFilteredDataChange}
        onSearchStateChange={handleSearchStateChange}
        placeholder="Search categories..."
        searchField="productName"
        childrenField="categories"
        minSearchLength={3}
        className="category-search-container"
      />
      <TreeList
        data={filteredData}
        heading={heading}
        showSelectAllButton={showSelectAllButton}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        isSearching={isSearching}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default Category;