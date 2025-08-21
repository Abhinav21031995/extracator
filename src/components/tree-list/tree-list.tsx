import React, { useState, useEffect } from 'react';
import { CategoryNode } from '../../models/category-tree';
import { GeographyNode } from '../../models/geography-tree';
import { MockCategoryHierarchyData } from '../../core/mock/data/mock-category-data';
import './tree-list.css';

// Type to support both CategoryNode and GeographyNode
type TreeNodeType = CategoryNode | GeographyNode;

export interface TreeListProps {
  data?: TreeNodeType[];
  heading?: string;
  showSelectAllButton?: boolean;
  
  // New generic props (preferred)
  selectedItems?: string[];
  setSelectedItems?: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Legacy specific props (backward compatibility)
  selectedCategories?: string[];
  setSelectedCategories?: React.Dispatch<React.SetStateAction<string[]>>;
  selectedGeographies?: string[];
  setSelectedGeographies?: React.Dispatch<React.SetStateAction<string[]>>;
  
  isSearching?: boolean;
  searchQuery?: string;
  initiallyExpanded?: boolean;
  nodeType?: 'category' | 'geography';
  shouldReset?: boolean;
  onResetComplete?: () => void;
}

// Interface for managing selection and expansion state
interface SelectionMap {
  [key: string]: boolean;
}

// Type guards
const isCategoryNode = (node: TreeNodeType): node is CategoryNode => {
  return 'productName' in node && 'categories' in node;
};

const isGeographyNode = (node: TreeNodeType): node is GeographyNode => {
  return 'geographyName' in node && 'geographies' in node;
};

// Generic helper functions
const getNodeKey = (node: TreeNodeType): string => {
  if (isCategoryNode(node)) {
    return String(node.productID ?? node.categoryID ?? node.productName);
  } else {
    return String(node.geographyID ?? node.geographyName);
  }
};

const getNodeName = (node: TreeNodeType): string => {
  if (isCategoryNode(node)) {
    return node.productName;
  } else {
    return node.geographyName;
  }
};

const getNodeChildren = (node: TreeNodeType): TreeNodeType[] => {
  if (isCategoryNode(node)) {
    return node.categories as TreeNodeType[];
  } else {
    return node.geographies as TreeNodeType[];
  }
};

const getCanSelectSubItems = (node: TreeNodeType): boolean => {
  if (isCategoryNode(node)) {
    return node.canSelectsubcategories;
  } else {
    return node.canSelectSubGeographies;
  }
};

const TreeList = ({
  data = MockCategoryHierarchyData as TreeNodeType[],
  heading = 'Select Items',
  showSelectAllButton = true,
  selectedItems = [],
  setSelectedItems,
  selectedCategories = [],
  setSelectedCategories,
  selectedGeographies = [],
  setSelectedGeographies,
  isSearching = false,
  searchQuery = '',
  initiallyExpanded = true, // Default to true for backward compatibility
  nodeType = 'category',
  shouldReset = false,
  onResetComplete
}: TreeListProps) => {
  // Smart prop selection: prefer generic props, fallback to specific props
  const actualSelectedItems = selectedItems && selectedItems.length > 0 
    ? selectedItems 
    : (nodeType === 'category' ? selectedCategories : selectedGeographies);
    
  const actualSetSelectedItems = setSelectedItems 
    || (nodeType === 'category' ? setSelectedCategories : setSelectedGeographies);
  // Selection and expansion state
  const [selection, setSelection] = useState<SelectionMap>({});
  const [expanded, setExpanded] = useState<SelectionMap>({});
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Handle both initial setup and reset
  useEffect(() => {
    if (data && (shouldReset || !Object.keys(expanded).length)) {
      setExpanded((prevExpanded) => {
        const newExpanded: SelectionMap = {};
        
        // Only expand root nodes based on initiallyExpanded setting
        data.forEach((node) => {
          const nodeKey = getNodeKey(node);
          newExpanded[nodeKey] = initiallyExpanded;
        });
        
        return newExpanded;
      });

      // If this was triggered by a reset, notify parent
      if (shouldReset) {
        onResetComplete?.();
      }
    }
  }, [data, shouldReset, initiallyExpanded, expanded, onResetComplete]);

  // Handle search mode expansion - expand nodes that have matching children
  useEffect(() => {
    if (isSearching && data) {
      setExpanded((prevExpanded) => {
        const newExpanded: SelectionMap = { ...prevExpanded };
        
        // Expand all nodes that have children in search results
        const expandNodesWithMatches = (nodes: TreeNodeType[]) => {
          nodes.forEach((node) => {
            const nodeKey = getNodeKey(node);
            const children = getNodeChildren(node);
            if (Array.isArray(children) && children.length > 0) {
              newExpanded[nodeKey] = true;
              expandNodesWithMatches(children);
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
    // Support both legacy and new event handling approaches
    const eventName = nodeType === 'category' ? 'categorySelectionChanged' : 'geographySelectionChanged';
    const clearAllEventName = nodeType === 'category' ? 'categoryClearAll' : 'geographyClearAll';
    const itemNameKey = nodeType === 'category' ? 'categoryName' : 'geographyName';
    
    const handleSelectionChange = (event: CustomEvent<any>) => {
      
      // Support both old and new event detail formats
      const itemName = event.detail.itemName || event.detail[itemNameKey];
      const { selected } = event.detail;
      
      // Find the node in the data
      const findNodeByName = (nodes: TreeNodeType[], name: string): TreeNodeType | null => {
        for (const node of nodes) {
          const nodeName = getNodeName(node);
          if (nodeName === name) {
            return node;
          }
          const children = getNodeChildren(node);
          if (Array.isArray(children)) {
            const found = findNodeByName(children, name);
            if (found) return found;
          }
        }
        return null;
      };

      const targetNode = findNodeByName(data, itemName);
      if (targetNode) {
        const nodeKey = getNodeKey(targetNode);
        
        setSelection(prev => {
          const newSelection = { ...prev };
          newSelection[nodeKey] = selected;
          return newSelection;
        });
      }
    };

    const handleClearAll = () => {
      // Clear all node selections and update state
      setSelection({});
      setIsAllSelected(false);
    };

    // Add event listeners
    window.addEventListener(eventName, handleSelectionChange as EventListener);
    window.addEventListener(clearAllEventName, handleClearAll as EventListener);

    return () => {
      window.removeEventListener(eventName, handleSelectionChange as EventListener);
      window.removeEventListener(clearAllEventName, handleClearAll as EventListener);
    };
  }, [data]);

  // Synchronize internal selection state with external selected items prop
  useEffect(() => {
    
    if (data) {
      const newSelection: SelectionMap = {};
      
      // Helper function to find and mark selected nodes
      const markSelectedNodes = (nodes: TreeNodeType[]) => {
        nodes.forEach((node) => {
          const nodeKey = getNodeKey(node);
          const nodeName = getNodeName(node);
          const isSelected = actualSelectedItems.includes(nodeName);
          
          if (isSelected) {
            newSelection[nodeKey] = true;
          }
          
          // Recursively check children
          const children = getNodeChildren(node);
          if (Array.isArray(children) && children.length > 0) {
            markSelectedNodes(children);
          }
        });
      };
      
      markSelectedNodes(data);
      
      setSelection(newSelection);
      
      // Update "Select All" state - collect all item names and check if all are selected
      const allItemNames: string[] = [];
      const collectNames = (nodes: TreeNodeType[]) => {
        nodes.forEach((node) => {
          const nodeName = getNodeName(node);
          allItemNames.push(nodeName);
          const children = getNodeChildren(node);
          if (Array.isArray(children)) {
            collectNames(children);
          }
        });
      };
      collectNames(data);
      
      const isAllCurrentlySelected = allItemNames.length > 0 && 
        allItemNames.every((name: string) => actualSelectedItems.includes(name));
      setIsAllSelected(isAllCurrentlySelected);
    }
  }, [actualSelectedItems, data]);

  // Helper: Recursively set selection for a node and its children
  const setNodeSelection = (
    node: TreeNodeType,
    isSelected: boolean,
    map: SelectionMap = { ...selection }
  ): SelectionMap => {
    map[getNodeKey(node)] = isSelected;
    const children = getNodeChildren(node);
    if (Array.isArray(children)) {
      children.forEach((child) => setNodeSelection(child, isSelected, map));
    }
    return map;
  };

  // Helper: Recursively check if all children are selected
  const isCategoryAndAllSelected = (node: TreeNodeType): boolean => {
    const children = getNodeChildren(node);
    if (!Array.isArray(children) || children.length === 0) {
      return !!selection[getNodeKey(node)];
    }
    return (
      !!selection[getNodeKey(node)] &&
      children.every((child) => isCategoryAndAllSelected(child))
    );
  };

  // Generic alias for backward compatibility
  const isItemAndAllSelected = isCategoryAndAllSelected;

  // Helper: Recursively check if all lowest-level children are selected
  const isLowestCategorySelected = (node: TreeNodeType): boolean => {
    const children = getNodeChildren(node);
    if (!Array.isArray(children) || children.length === 0) {
      return !!selection[getNodeKey(node)];
    }
    return children.every((child) => isLowestCategorySelected(child));
  };

  // Generic alias for backward compatibility
  const isLowestItemSelected = isLowestCategorySelected;

  // Toggle selection for a single node
  const toggleSelection = (node: TreeNodeType) => {
    setSelection((prev) => {
      const newMap = { ...prev };
      const nodeKey = getNodeKey(node);
      const newState = !prev[nodeKey];
      newMap[nodeKey] = newState;
      
      const nodeName = getNodeName(node);
      
      // Update parent state if actualSetSelectedItems is available
      if (actualSetSelectedItems) {
        actualSetSelectedItems((prevItems: string[]) => {
          let newItems;
          if (newState) {
            // Add item if not already present
            if (!prevItems.includes(nodeName)) {
              newItems = [...prevItems, nodeName];
            } else {
              newItems = prevItems;
            }
          } else {
            // Remove item
            newItems = prevItems.filter(item => item !== nodeName);
          }
          
          return newItems;
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
    
    // Update parent state if actualSetSelectedItems is available
    if (actualSetSelectedItems) {
      if (newState) {
        // Select all - collect all item names
        const allItemNames: string[] = [];
        const collectNames = (nodes: TreeNodeType[]) => {
          nodes.forEach((node) => {
            const nodeName = getNodeName(node);
            allItemNames.push(nodeName);
            const children = getNodeChildren(node);
            if (Array.isArray(children)) {
              collectNames(children);
            }
          });
        };
        collectNames(data);
        actualSetSelectedItems(allItemNames);
      } else {
        // Clear all
        actualSetSelectedItems([]);
      }
      
    }
  };

  // Toggle lowest-level selection for a node
  const toggleLowestCategorySelection = (node: TreeNodeType) => {
    const children = getNodeChildren(node);
    if (!Array.isArray(children) || children.length === 0) {
      toggleSelection(node);
    } else {
      // Toggle all lowest-level children
      const newState = !isLowestCategorySelected(node);
      let newMap = { ...selection };
      const lowestNodes: TreeNodeType[] = [];
      
      const selectLowest = (n: TreeNodeType) => {
        const nodeChildren = getNodeChildren(n);
        if (!Array.isArray(nodeChildren) || nodeChildren.length === 0) {
          newMap[getNodeKey(n)] = newState;
          lowestNodes.push(n);
        } else {
          nodeChildren.forEach(selectLowest);
        }
      };
      selectLowest(node);
      setSelection(newMap);
      
      // Update parent state if actualSetSelectedItems is available
      if (actualSetSelectedItems) {
        actualSetSelectedItems((prevItems: string[]) => {
          let newItems = [...prevItems];
          lowestNodes.forEach((lowestNode) => {
            const nodeName = getNodeName(lowestNode);
            if (newState) {
              // Add item if not already present
              if (!newItems.includes(nodeName)) {
                newItems.push(nodeName);
              }
            } else {
              // Remove item
              newItems = newItems.filter(item => item !== nodeName);
            }
          });
          
          return newItems;
        });
      }
    }
  };

  // Generic alias for backward compatibility
  const toggleLowestItemSelection = toggleLowestCategorySelection;

  // Toggle selection for a node and all its subcategories
  const toggleAllCategorySelection = (node: TreeNodeType) => {
    const newState = !isCategoryAndAllSelected(node);
    let newMap = { ...selection };
    const allNodes: TreeNodeType[] = [];
    
    const collectAllNodes = (n: TreeNodeType) => {
      allNodes.push(n);
      const children = getNodeChildren(n);
      if (Array.isArray(children)) {
        children.forEach(collectAllNodes);
      }
    };
    
    collectAllNodes(node);
    setNodeSelection(node, newState, newMap);
    setSelection({ ...newMap });
    
    // Update parent state if actualSetSelectedItems is available
    if (actualSetSelectedItems) {
      actualSetSelectedItems((prevItems: string[]) => {
        let newItems = [...prevItems];
        allNodes.forEach((selectedNode) => {
          const nodeName = getNodeName(selectedNode);
          if (newState) {
            // Add item if not already present
            if (!newItems.includes(nodeName)) {
              newItems.push(nodeName);
            }
          } else {
            // Remove item
            newItems = newItems.filter(item => item !== nodeName);
          }
        });
        
        return newItems;
      });
    }
  };

  // Generic alias for backward compatibility
  const toggleAllItemSelection = toggleAllCategorySelection;

  // Toggle expand/collapse
  const toggleExpand = (node: TreeNodeType) => {
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
  const isDirectMatch = (node: TreeNodeType) => {
    return '_isDirectMatch' in node && (node as any)._isDirectMatch === true;
  };

  // Check if a node has matching children
  const hasMatchingChildren = (node: TreeNodeType) => {
    return '_hasMatchingChildren' in node && (node as any)._hasMatchingChildren === true;
  };

  // Render tree recursively
  const renderTree = (
    nodes: TreeNodeType[],
    parent: TreeNodeType | null = null,
    level = 0
  ) => (
    <ul className="tree-list-ul" style={{ listStyle: 'none', paddingLeft: level === 0 ? 0 : 20 }}>
      {nodes.map((node) => {
        const children = getNodeChildren(node);
        const hasChildren = Array.isArray(children) && children.length > 0;
        const nodeKey = getNodeKey(node);
        const nodeName = getNodeName(node);
        const isExpanded = expanded[nodeKey];
        const isNodeDirectMatch = isDirectMatch(node);
        const nodeHasMatchingChildren = hasMatchingChildren(node);
        const canSelectSubItems = getCanSelectSubItems(node);
        
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
                {isSearching ? highlightSearchTerm(nodeName, searchQuery) : nodeName}
                {isSearching && nodeHasMatchingChildren && !isNodeDirectMatch && (
                  <span className="match-indicator"> (contains matches)</span>
                )}
              </span>

              {/* Action buttons container */}
              <div className="action-buttons">
                {/* Select only lowest level items */}
                {parent !== null && hasChildren && (
                  <button 
                    className="icon-btn lowest-btn" 
                    onClick={() => toggleLowestCategorySelection(node)}
                    title={isLowestCategorySelected(node) ? `Unselect Lowest ${nodeType === 'category' ? 'Categories' : 'Geographies'}` : `Select Lowest ${nodeType === 'category' ? 'Categories' : 'Geographies'}`}
                  >
                    ↓
                  </button>
                )}

                {/* Select item and all sub-items */}
                {canSelectSubItems && (
                  <button 
                    className="icon-btn all-btn" 
                    onClick={() => toggleAllCategorySelection(node)}
                    title={isCategoryAndAllSelected(node) ? `Unselect All Sub${nodeType === 'category' ? 'categories' : 'geographies'}` : `Select All Sub${nodeType === 'category' ? 'categories' : 'geographies'}`}
                  >
                    ⊞
                  </button>
                )}
              </div>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && renderTree(children, node, level + 1)}
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