// Example usage of the generic SearchBar component

import React, { useState } from 'react';
import SearchBar from './searchbar';

// Example 1: Simple list search
interface User {
  id: number;
  name: string;
  email: string;
}

const UserSearchExample = () => {
  const [users] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    // ... more users
  ]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  return (
    <div>
      <SearchBar<User>
        data={users}
        onFilteredDataChange={setFilteredUsers}
        placeholder="Search users..."
        searchField="name"
        minSearchLength={2}
      />
      {/* Render filtered users */}
    </div>
  );
};

// Example 2: Complex search with custom function
interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
}

const ProductSearchExample = () => {
  const [products] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Custom search function that searches multiple fields
  const getSearchableText = (product: Product) => {
    return `${product.title} ${product.description} ${product.category}`;
  };

  return (
    <div>
      <SearchBar<Product>
        data={products}
        onFilteredDataChange={setFilteredProducts}
        placeholder="Search products..."
        searchField={getSearchableText}
        minSearchLength={3}
        debounceMs={500}
      />
      {/* Render filtered products */}
    </div>
  );
};

// Example 3: Hierarchical data search (like categories)
interface MenuItem {
  id: number;
  name: string;
  subMenus?: MenuItem[];
}

const MenuSearchExample = () => {
  const [menuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>(menuItems);

  return (
    <div>
      <SearchBar<MenuItem>
        data={menuItems}
        onFilteredDataChange={setFilteredMenuItems}
        placeholder="Search menu items..."
        searchField="name"
        childrenField="subMenus"
        minSearchLength={2}
        className="menu-search-container"
      />
      {/* Render filtered menu items */}
    </div>
  );
};

export { UserSearchExample, ProductSearchExample, MenuSearchExample };
