import React, { useState, useEffect } from 'react';
import { CategoryNode } from '../../models/category-tree';
import { MockCategoryHierarchyData } from '../../core/mock/data/mock-category-data';
import './tree-list.css';

export interface TreeListProps {
  data?: CategoryNode[];
  heading?: string;
  showSelectAllButton?: boolean;
  selectedCategories?: string[];
  setSelectedCategories?: React.Dispatch<React.SetStateAction<string[]>>;
  isSearching?: boolean;
  searchQuery?: string;
}

interface SelectionMap {
  [key: string]: boolean;
}

const getNodeKey = (node: CategoryNode) =>
  String(node.productID ?? node.categoryID ?? node.productName);

const TreeList = ({
  data = MockCategoryHierarchyData,
  heading = 'Select Categories',
  showSelectAllButton = true,
  selectedCategories = [],
  setSelectedCategories,
  isSearching = false,
  searchQuery = ''
}: TreeListProps) => {
  // Selection and expansion state
  const [selection, setSelection] = useState<SelectionMap>({});
  const [expanded, setExpanded] = useState<SelectionMap>({});
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Initialize expansion state - only run once when data changes
  useEffect(() => {
    if (data) {
      setExpanded((prevExpanded) => {
        const newExpanded: SelectionMap = { ...prevExpanded };
        
        // Only expand root nodes by default if they haven't been set before
        data.forEach((node) => {
          const nodeKey = getNodeKey(node);
          if (!(nodeKey in newExpanded)) {
            newExpanded[nodeKey] = true; // Back to auto-expand for categories
          }
        });
        
        return newExpanded;
      });
    }
  }, [data]);

  // Handle search mode expansion - expand nodes that have matching children
  useEffect(() => {
    if (isSearching && data) {
      setExpanded((prevExpanded) => {
        const newExpanded: SelectionMap = { ...prevExpanded };
        
        // Expand all nodes that have children in search results
        const expandNodesWithMatches = (nodes: CategoryNode[]) => {
          nodes.forEach((node) => {
            const nodeKey = getNodeKey(node);
            if (Array.isArray(node.categories) && node.categories.length > 0) {
              newExpanded[nodeKey] = true;
              expandNodesWithMatches(node.categories);
            }
          });
        };
        
        expandNodesWithMatches(data);
        return newExpanded;
      });
    }
  }, [isSearching, data]);

  // Listen for external events from SelectionWizard
  useEffect(() => {
    const handleSelectionChange = (event: CustomEvent<{ categoryName: string; selected: boolean; updateNode?: boolean }>) => {
      console.log('[TreeList] Received categorySelectionChanged event:', event.detail);
      
      const { categoryName, selected } = event.detail;
      
      // Find the node in the data
      const findNodeByName = (nodes: CategoryNode[], name: string): CategoryNode | null => {
        for (const node of nodes) {
          if (node.productName === name) {
            return node;
          }
          if (Array.isArray(node.categories)) {
            const found = findNodeByName(node.categories, name);
            if (found) return found;
          }
        }
        return null;
      };

      const targetNode = findNodeByName(data, categoryName);
      if (targetNode) {
        const nodeKey = getNodeKey(targetNode);
        console.log('[TreeList] Updating node selection:', { nodeKey, selected });
        
        setSelection(prev => {
          const newSelection = { ...prev };
          newSelection[nodeKey] = selected;
          console.log('[TreeList] Selection updated:', newSelection);
          return newSelection;
        });
      }
    };

    const handleClearAll = () => {
      console.log('[TreeList] Received categoryClearAll event');
      // Clear all node selections and update state
      setSelection({});
      setIsAllSelected(false);
    };

    window.addEventListener('categorySelectionChanged', handleSelectionChange as EventListener);
    window.addEventListener('categoryClearAll', handleClearAll as EventListener);

    return () => {
      window.removeEventListener('categorySelectionChanged', handleSelectionChange as EventListener);
      window.removeEventListener('categoryClearAll', handleClearAll as EventListener);
    };
  }, [data]);

  // Synchronize internal selection state with external selectedCategories prop
  useEffect(() => {
    console.log('[TreeList] Synchronizing with selectedCategories:', selectedCategories);
    
    if (data) {
      const newSelection: SelectionMap = {};
      
      // Helper function to find and mark selected nodes
      const markSelectedNodes = (nodes: CategoryNode[]) => {
        nodes.forEach((node) => {
          const nodeKey = getNodeKey(node);
          const isSelected = selectedCategories.includes(node.productName);
          
          if (isSelected) {
            newSelection[nodeKey] = true;
          }
          
          // Recursively check children
          if (Array.isArray(node.categories) && node.categories.length > 0) {
            markSelectedNodes(node.categories);
          }
        });
      };
      
      markSelectedNodes(data);
      
      console.log('[TreeList] New selection state:', newSelection);
      setSelection(newSelection);
      
      // Update "Select All" state - collect all category names and check if all are selected
      const allCategoryNames: string[] = [];
      const collectNames = (nodes: CategoryNode[]) => {
        nodes.forEach((node) => {
          allCategoryNames.push(node.productName);
          if (Array.isArray(node.categories)) {
            collectNames(node.categories);
          }
        });
      };
      collectNames(data);
      
      const isAllCurrentlySelected = allCategoryNames.length > 0 && 
        allCategoryNames.every((name: string) => selectedCategories.includes(name));
      setIsAllSelected(isAllCurrentlySelected);
    }
  }, [selectedCategories, data]);

  // Helper: Recursively set selection for a node and its children
  const setNodeSelection = (
    node: CategoryNode,
    isSelected: boolean,
    map: SelectionMap = { ...selection }
  ): SelectionMap => {
    map[getNodeKey(node)] = isSelected;
    if (Array.isArray(node.categories)) {
      node.categories.forEach((child) => setNodeSelection(child, isSelected, map));
    }
    return map;
  };

  // Helper: Recursively check if all children are selected
  const isCategoryAndAllSelected = (node: CategoryNode): boolean => {
    if (!Array.isArray(node.categories) || node.categories.length === 0) {
      return !!selection[getNodeKey(node)];
    }
    return (
      !!selection[getNodeKey(node)] &&
      node.categories.every((child) => isCategoryAndAllSelected(child))
    );
  };

  // Helper: Recursively check if all lowest-level children are selected
  const isLowestCategorySelected = (node: CategoryNode): boolean => {
    if (!Array.isArray(node.categories) || node.categories.length === 0) {
      return !!selection[getNodeKey(node)];
    }
    return node.categories.every((child) => isLowestCategorySelected(child));
  };

  // Toggle selection for a single node
  const toggleSelection = (node: CategoryNode) => {
    setSelection((prev) => {
      const newMap = { ...prev };
      const nodeKey = getNodeKey(node);
      const newState = !prev[nodeKey];
      newMap[nodeKey] = newState;
      
      console.log('[TreeList] Toggle selection:', {
        node: node.productName,
        newState,
        setSelectedCategories: !!setSelectedCategories
      });
      
      // Update parent state if setSelectedCategories is available
      if (setSelectedCategories) {
        setSelectedCategories((prevCats: string[]) => {
          let newCats;
          if (newState) {
            // Add category if not already present
            if (!prevCats.includes(node.productName)) {
              newCats = [...prevCats, node.productName];
            } else {
              newCats = prevCats;
            }
          } else {
            // Remove category
            newCats = prevCats.filter(cat => cat !== node.productName);
          }
          
          console.log('[TreeList] Updated selectedCategories:', {
            before: prevCats,
            after: newCats,
            action: newState ? 'added' : 'removed',
            category: node.productName
          });
          
          return newCats;
        });
      }
      
      return newMap;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const newState = !isAllSelected;
    setIsAllSelected(newState);
    let newMap: SelectionMap = { ...selection };
    data.forEach((node) => {
      newMap = setNodeSelection(node, newState, newMap);
    });
    setSelection(newMap);
    
    // Update parent state if setSelectedCategories is available
    if (setSelectedCategories) {
      if (newState) {
        // Select all - collect all category names
        const allCategoryNames: string[] = [];
        const collectNames = (nodes: CategoryNode[]) => {
          nodes.forEach((node) => {
            allCategoryNames.push(node.productName);
            if (Array.isArray(node.categories)) {
              collectNames(node.categories);
            }
          });
        };
        collectNames(data);
        setSelectedCategories(allCategoryNames);
      } else {
        // Clear all
        setSelectedCategories([]);
      }
      
      console.log('[TreeList] Select All toggled:', {
        newState,
        action: newState ? 'selected all' : 'cleared all'
      });
    }
  };

  // Toggle lowest-level selection for a node
  const toggleLowestCategorySelection = (node: CategoryNode) => {
    if (!Array.isArray(node.categories) || node.categories.length === 0) {
      toggleSelection(node);
    } else {
      // Toggle all lowest-level children
      const newState = !isLowestCategorySelected(node);
      let newMap = { ...selection };
      const lowestNodes: CategoryNode[] = [];
      
      const selectLowest = (n: CategoryNode) => {
        if (!Array.isArray(n.categories) || n.categories.length === 0) {
          newMap[getNodeKey(n)] = newState;
          lowestNodes.push(n);
        } else {
          n.categories.forEach(selectLowest);
        }
      };
      selectLowest(node);
      setSelection(newMap);
      
      // Update parent state if setSelectedCategories is available
      if (setSelectedCategories) {
        setSelectedCategories((prevCats: string[]) => {
          let newCats = [...prevCats];
          lowestNodes.forEach((lowestNode) => {
            if (newState) {
              // Add category if not already present
              if (!newCats.includes(lowestNode.productName)) {
                newCats.push(lowestNode.productName);
              }
            } else {
              // Remove category
              newCats = newCats.filter(cat => cat !== lowestNode.productName);
            }
          });
          
          console.log('[TreeList] Lowest categories updated:', {
            action: newState ? 'selected' : 'unselected',
            categories: lowestNodes.map(n => n.productName)
          });
          
          return newCats;
        });
      }
    }
  };

  // Toggle selection for a node and all its subcategories
  const toggleAllCategorySelection = (node: CategoryNode) => {
    const newState = !isCategoryAndAllSelected(node);
    let newMap = { ...selection };
    const allNodes: CategoryNode[] = [];
    
    const collectAllNodes = (n: CategoryNode) => {
      allNodes.push(n);
      if (Array.isArray(n.categories)) {
        n.categories.forEach(collectAllNodes);
      }
    };
    
    collectAllNodes(node);
    setNodeSelection(node, newState, newMap);
    setSelection({ ...newMap });
    
    // Update parent state if setSelectedCategories is available
    if (setSelectedCategories) {
      setSelectedCategories((prevCats: string[]) => {
        let newCats = [...prevCats];
        allNodes.forEach((selectedNode) => {
          if (newState) {
            // Add category if not already present
            if (!newCats.includes(selectedNode.productName)) {
              newCats.push(selectedNode.productName);
            }
          } else {
            // Remove category
            newCats = newCats.filter(cat => cat !== selectedNode.productName);
          }
        });
        
        console.log('[TreeList] All subcategories updated:', {
          action: newState ? 'selected' : 'unselected',
          categories: allNodes.map(n => n.productName)
        });
        
        return newCats;
      });
    }
  };

  // Toggle expand/collapse
  const toggleExpand = (node: CategoryNode) => {
    setExpanded((prev) => ({
      ...prev,
      [getNodeKey(node)]: !prev[getNodeKey(node)],
    }));
  };

  // Function to highlight search terms
  const highlightSearchTerm = (text: string, query: string) => {
    if (!query || !isSearching) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="search-highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  // Check if a node is a direct match for search
  const isDirectMatch = (node: any) => {
    return node._isDirectMatch === true;
  };

  // Check if a node has matching children
  const hasMatchingChildren = (node: any) => {
    return node._hasMatchingChildren === true;
  };

  // Render tree recursively
  const renderTree = (
    nodes: CategoryNode[],
    parent: CategoryNode | null = null,
    level = 0
  ) => (
    <ul className="tree-list-ul" style={{ listStyle: 'none', paddingLeft: level === 0 ? 0 : 20 }}>
      {nodes.map((node) => {
        const hasChildren = Array.isArray(node.categories) && node.categories.length > 0;
        const nodeKey = getNodeKey(node);
        const isExpanded = expanded[nodeKey];
        const isNodeDirectMatch = isDirectMatch(node);
        const nodeHasMatchingChildren = hasMatchingChildren(node);
        
        return (
          <li key={nodeKey}>
            <div className={`tree-node ${isSearching ? 'search-mode' : ''} ${isNodeDirectMatch ? 'direct-match' : ''} ${nodeHasMatchingChildren ? 'has-matching-children' : ''}`}>
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <button className="toggle-btn" onClick={() => toggleExpand(node)}>
                  <span className="toggle-icon">{isExpanded ? '-' : '+'}</span>
                </button>
              )}

              {/* Checkbox for Selection (not for root) */}
              {parent !== null && (
                <input
                  type="checkbox"
                  checked={!!selection[nodeKey]}
                  onChange={() => toggleSelection(node)}
                  className="tree-node-checkbox"
                />
              )}

              {/* Node Name with highlighting */}
              <span className="tree-node-label">
                {isSearching ? highlightSearchTerm(node.productName, searchQuery) : node.productName}
                {isSearching && nodeHasMatchingChildren && !isNodeDirectMatch && (
                  <span className="match-indicator"> (contains matches)</span>
                )}
              </span>

              {/* Action buttons container */}
              <div className="action-buttons">
                {/* Select only lowest level categories */}
                {parent !== null && hasChildren && (
                  <button 
                    className="icon-btn lowest-btn" 
                    onClick={() => toggleLowestCategorySelection(node)}
                    title={isLowestCategorySelected(node) ? 'Unselect Lowest Categories' : 'Select Lowest Categories'}
                  >
                    ↓
                  </button>
                )}

                {/* Select category and all subcategories */}
                {node.canSelectsubcategories && (
                  <button 
                    className="icon-btn all-btn" 
                    onClick={() => toggleAllCategorySelection(node)}
                    title={isCategoryAndAllSelected(node) ? 'Unselect All Subcategories' : 'Select All Subcategories'}
                  >
                    ⊞
                  </button>
                )}
              </div>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && renderTree(node.categories, node, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="tree-list">
      {heading && (
        <div className="tree-header-container">
          <h2 className="Page-header">{heading}</h2>
          {showSelectAllButton && (
            <div className="select-all-header">
              <span className="select-all" onClick={toggleSelectAll}>
                {isAllSelected ? 'Clear All' : 'Select All'}
              </span>
            </div>
          )}
        </div>
      )}
      
      {isSearching && (
        <div className="search-info">
          <span className="search-results-text">
            Search results for "{searchQuery}"
          </span>
          <small className="search-help-text">
            🔵 Direct matches | 🔘 Contains matches
          </small>
        </div>
      )}
      
      {renderTree(data)}
    </div>
  );
};

export default TreeList;