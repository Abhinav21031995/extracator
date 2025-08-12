import React, { useState, useEffect } from 'react';
import { GeographyNode } from '../../models/geography-tree';
import './geography-tree-list.css';

export interface GeographyTreeListProps {
  data?: GeographyNode[];
  heading?: string;
  showSelectAllButton?: boolean;
  selectedGeographies?: string[];
  setSelectedGeographies?: React.Dispatch<React.SetStateAction<string[]>>;
  isSearching?: boolean;
  searchQuery?: string;
}

interface SelectionMap {
  [key: string]: boolean;
}

const getNodeKey = (node: GeographyNode) =>
  String(node.geographyID ?? node.geographyName);

const GeographyTreeList = ({
  data = [],
  heading = 'Select Geographies',
  showSelectAllButton = true,
  selectedGeographies = [],
  setSelectedGeographies,
  isSearching = false,
  searchQuery = ''
}: GeographyTreeListProps) => {
  // Selection and expansion state
  const [selection, setSelection] = useState<SelectionMap>({});
  const [expanded, setExpanded] = useState<SelectionMap>({});
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Initialize expansion state - only run once when data changes
  useEffect(() => {
    if (data) {
      setExpanded((prevExpanded) => {
        const newExpanded: SelectionMap = { ...prevExpanded };
        
        // Keep all nodes collapsed by default if they haven't been set before
        data.forEach((node) => {
          const nodeKey = getNodeKey(node);
          if (!(nodeKey in newExpanded)) {
            newExpanded[nodeKey] = false; // Changed from true to false to keep collapsed
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
        const expandNodesWithMatches = (nodes: GeographyNode[]) => {
          nodes.forEach((node) => {
            const nodeKey = getNodeKey(node);
            if (Array.isArray(node.geographies) && node.geographies.length > 0) {
              newExpanded[nodeKey] = true;
              expandNodesWithMatches(node.geographies);
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
    const handleSelectionChange = (event: CustomEvent<{ geographyName: string; selected: boolean; updateNode?: boolean }>) => {
      console.log('[GeographyTreeList] Received geographySelectionChanged event:', event.detail);
      
      const { geographyName, selected } = event.detail;
      
      // Find the node in the data
      const findNodeByName = (nodes: GeographyNode[], name: string): GeographyNode | null => {
        for (const node of nodes) {
          if (node.geographyName === name) {
            return node;
          }
          if (Array.isArray(node.geographies)) {
            const found = findNodeByName(node.geographies, name);
            if (found) return found;
          }
        }
        return null;
      };

      const targetNode = findNodeByName(data, geographyName);
      if (targetNode) {
        const nodeKey = getNodeKey(targetNode);
        console.log('[GeographyTreeList] Updating node selection:', { nodeKey, selected });
        
        setSelection(prev => {
          const newSelection = { ...prev };
          newSelection[nodeKey] = selected;
          console.log('[GeographyTreeList] Selection updated:', newSelection);
          return newSelection;
        });
      }
    };

    const handleClearAll = () => {
      console.log('[GeographyTreeList] Received geographyClearAll event');
      // Clear all node selections and update state
      setSelection({});
      setIsAllSelected(false);
    };

    window.addEventListener('geographySelectionChanged', handleSelectionChange as EventListener);
    window.addEventListener('geographyClearAll', handleClearAll as EventListener);

    return () => {
      window.removeEventListener('geographySelectionChanged', handleSelectionChange as EventListener);
      window.removeEventListener('geographyClearAll', handleClearAll as EventListener);
    };
  }, [data]);

  // Synchronize internal selection state with external selectedGeographies prop
  useEffect(() => {
    console.log('[GeographyTreeList] Synchronizing with selectedGeographies:', selectedGeographies);
    
    if (data) {
      const newSelection: SelectionMap = {};
      
      // Helper function to find and mark selected nodes
      const markSelectedNodes = (nodes: GeographyNode[]) => {
        nodes.forEach((node) => {
          const nodeKey = getNodeKey(node);
          const isSelected = selectedGeographies.includes(node.geographyName);
          
          if (isSelected) {
            newSelection[nodeKey] = true;
          }
          
          // Recursively check children
          if (Array.isArray(node.geographies) && node.geographies.length > 0) {
            markSelectedNodes(node.geographies);
          }
        });
      };
      
      markSelectedNodes(data);
      
      console.log('[GeographyTreeList] New selection state:', newSelection);
      setSelection(newSelection);
      
      // Update "Select All" state - collect all geography names and check if all are selected
      const allGeographyNames: string[] = [];
      const collectNames = (nodes: GeographyNode[]) => {
        nodes.forEach((node) => {
          allGeographyNames.push(node.geographyName);
          if (Array.isArray(node.geographies)) {
            collectNames(node.geographies);
          }
        });
      };
      collectNames(data);
      
      const isAllCurrentlySelected = allGeographyNames.length > 0 && 
        allGeographyNames.every((name: string) => selectedGeographies.includes(name));
      setIsAllSelected(isAllCurrentlySelected);
    }
  }, [selectedGeographies, data]);

  // Helper: Recursively set selection for a node and its children
  const setNodeSelection = (
    node: GeographyNode,
    isSelected: boolean,
    map: SelectionMap = { ...selection }
  ): SelectionMap => {
    map[getNodeKey(node)] = isSelected;
    if (Array.isArray(node.geographies)) {
      node.geographies.forEach((child) => setNodeSelection(child, isSelected, map));
    }
    return map;
  };

  // Helper: Recursively check if all children are selected
  const isGeographyAndAllSelected = (node: GeographyNode): boolean => {
    if (!Array.isArray(node.geographies) || node.geographies.length === 0) {
      return !!selection[getNodeKey(node)];
    }
    return (
      !!selection[getNodeKey(node)] &&
      node.geographies.every((child) => isGeographyAndAllSelected(child))
    );
  };

  // Helper: Recursively check if all lowest-level children are selected
  const isLowestGeographySelected = (node: GeographyNode): boolean => {
    if (!Array.isArray(node.geographies) || node.geographies.length === 0) {
      return !!selection[getNodeKey(node)];
    }
    return node.geographies.every((child) => isLowestGeographySelected(child));
  };

  // Toggle selection for a single node
  const toggleSelection = (node: GeographyNode) => {
    setSelection((prev) => {
      const newMap = { ...prev };
      const nodeKey = getNodeKey(node);
      const newState = !prev[nodeKey];
      newMap[nodeKey] = newState;
      
      console.log('[GeographyTreeList] Toggle selection:', {
        node: node.geographyName,
        newState,
        setSelectedGeographies: !!setSelectedGeographies
      });
      
      // Update parent state if setSelectedGeographies is available
      if (setSelectedGeographies) {
        setSelectedGeographies((prevGeos: string[]) => {
          let newGeos;
          if (newState) {
            // Add geography if not already present
            if (!prevGeos.includes(node.geographyName)) {
              newGeos = [...prevGeos, node.geographyName];
            } else {
              newGeos = prevGeos;
            }
          } else {
            // Remove geography
            newGeos = prevGeos.filter(geo => geo !== node.geographyName);
          }
          
          console.log('[GeographyTreeList] Updated selectedGeographies:', {
            before: prevGeos,
            after: newGeos,
            action: newState ? 'added' : 'removed',
            geography: node.geographyName
          });
          
          return newGeos;
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
    
    // Update parent state if setSelectedGeographies is available
    if (setSelectedGeographies) {
      if (newState) {
        // Select all - collect all geography names
        const allGeographyNames: string[] = [];
        const collectNames = (nodes: GeographyNode[]) => {
          nodes.forEach((node) => {
            allGeographyNames.push(node.geographyName);
            if (Array.isArray(node.geographies)) {
              collectNames(node.geographies);
            }
          });
        };
        collectNames(data);
        setSelectedGeographies(allGeographyNames);
      } else {
        // Clear all
        setSelectedGeographies([]);
      }
      
      console.log('[GeographyTreeList] Select All toggled:', {
        newState,
        action: newState ? 'selected all' : 'cleared all'
      });
    }
  };

  // Toggle lowest-level selection for a node
  const toggleLowestGeographySelection = (node: GeographyNode) => {
    if (!Array.isArray(node.geographies) || node.geographies.length === 0) {
      toggleSelection(node);
    } else {
      // Toggle all lowest-level children
      const newState = !isLowestGeographySelected(node);
      let newMap = { ...selection };
      const lowestNodes: GeographyNode[] = [];
      
      const selectLowest = (n: GeographyNode) => {
        if (!Array.isArray(n.geographies) || n.geographies.length === 0) {
          newMap[getNodeKey(n)] = newState;
          lowestNodes.push(n);
        } else {
          n.geographies.forEach(selectLowest);
        }
      };
      selectLowest(node);
      setSelection(newMap);
      
      // Update parent state if setSelectedGeographies is available
      if (setSelectedGeographies) {
        setSelectedGeographies((prevGeos: string[]) => {
          let newGeos = [...prevGeos];
          lowestNodes.forEach((lowestNode) => {
            if (newState) {
              // Add geography if not already present
              if (!newGeos.includes(lowestNode.geographyName)) {
                newGeos.push(lowestNode.geographyName);
              }
            } else {
              // Remove geography
              newGeos = newGeos.filter(geo => geo !== lowestNode.geographyName);
            }
          });
          
          console.log('[GeographyTreeList] Lowest geographies updated:', {
            action: newState ? 'selected' : 'unselected',
            geographies: lowestNodes.map(n => n.geographyName)
          });
          
          return newGeos;
        });
      }
    }
  };

  // Toggle selection for a node and all its subgeographies
  const toggleAllGeographySelection = (node: GeographyNode) => {
    const newState = !isGeographyAndAllSelected(node);
    let newMap = { ...selection };
    const allNodes: GeographyNode[] = [];
    
    const collectAllNodes = (n: GeographyNode) => {
      allNodes.push(n);
      if (Array.isArray(n.geographies)) {
        n.geographies.forEach(collectAllNodes);
      }
    };
    
    collectAllNodes(node);
    setNodeSelection(node, newState, newMap);
    setSelection({ ...newMap });
    
    // Update parent state if setSelectedGeographies is available
    if (setSelectedGeographies) {
      setSelectedGeographies((prevGeos: string[]) => {
        let newGeos = [...prevGeos];
        allNodes.forEach((selectedNode) => {
          if (newState) {
            // Add geography if not already present
            if (!newGeos.includes(selectedNode.geographyName)) {
              newGeos.push(selectedNode.geographyName);
            }
          } else {
            // Remove geography
            newGeos = newGeos.filter(geo => geo !== selectedNode.geographyName);
          }
        });
        
        console.log('[GeographyTreeList] All subgeographies updated:', {
          action: newState ? 'selected' : 'unselected',
          geographies: allNodes.map(n => n.geographyName)
        });
        
        return newGeos;
      });
    }
  };

  // Toggle expand/collapse
  const toggleExpand = (node: GeographyNode) => {
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
    nodes: GeographyNode[],
    parent: GeographyNode | null = null,
    level = 0
  ) => (
    <ul className="tree-list-ul" style={{ listStyle: 'none', paddingLeft: level === 0 ? 0 : 20 }}>
      {nodes.map((node) => {
        const hasChildren = Array.isArray(node.geographies) && node.geographies.length > 0;
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
                {isSearching ? highlightSearchTerm(node.geographyName, searchQuery) : node.geographyName}
                {isSearching && nodeHasMatchingChildren && !isNodeDirectMatch && (
                  <span className="match-indicator"> (contains matches)</span>
                )}
              </span>

              {/* Action buttons container */}
              <div className="action-buttons">
                {/* Select only lowest level geographies */}
                {parent !== null && hasChildren && (
                  <button 
                    className="icon-btn lowest-btn" 
                    onClick={() => toggleLowestGeographySelection(node)}
                    title={isLowestGeographySelected(node) ? 'Unselect Lowest Geographies' : 'Select Lowest Geographies'}
                  >
                    ↓
                  </button>
                )}

                {/* Select geography and all subgeographies */}
                {node.canSelectSubGeographies && (
                  <button 
                    className="icon-btn all-btn" 
                    onClick={() => toggleAllGeographySelection(node)}
                    title={isGeographyAndAllSelected(node) ? 'Unselect All Subgeographies' : 'Select All Subgeographies'}
                  >
                    ⊞
                  </button>
                )}
              </div>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && renderTree(node.geographies, node, level + 1)}
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

export default GeographyTreeList;
