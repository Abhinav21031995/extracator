# React Extractor UI - Multi-Step Selection Wizard

A comprehensive React-based selection wizard for managing hierarchical category and geography data with advanced search, filtering, and selection capabilities.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture & Concepts](#architecture--concepts)
- [Data Flow](#data-flow)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [Key Features](#key-features)
- [Technical Implementation](#technical-implementation)
- [Usage Examples](#usage-examples)
- [Getting Started](#getting-started)
- [Learning Resources](#learning-resources)

## 🎯 Project Overview

The React Extractor UI is a sophisticated multi-step wizard that allows users to:

1. **Select Categories** from a hierarchical tree structure
2. **Select Geographies** from a global continent/country hierarchy  
3. **Search and filter** through large datasets efficiently
4. **Manage selections** with real-time feedback and validation
5. **Navigate** between steps with context-aware controls




## 🏗 Architecture & Concepts

### **Core Architectural Patterns**

#### 1. **Component-Based Architecture**
```
App.tsx (Main Container)
├── Category Component (Step 1)
│   ├── SearchBar (Generic)
│   └── TreeList (Generic tree component)
├── Geography Component (Step 2)  
│   ├── SearchBar (Generic)
│   └── TreeList (Generic tree component)
└── SelectionWizard (Always Visible)
    ├── Collapsible Sections
    ├── Selection Management
    └── Navigation Controls
```

#### 2. **State Management Pattern**
- **Centralized State**: Main App component manages all selection state
- **Props Drilling**: State passed down to child components
- **Event-Driven Updates**: Components communicate through callback props
- **Immutable Updates**: State changes create new objects/arrays

#### 3. **Generic Component Design**
- **SearchBar**: Reusable across different data types
- **TreeList**: Unified generic tree component supporting both CategoryNode and GeographyNode
- **TypeScript Generics**: Type-safe for any data structure with union types
- **Interface-Based**: Flexible configuration through props
- **Type Guards**: Runtime type checking for different node types
- **Consistent Implementation**: Both Category and Geography components use the same TreeList architecture

### **Key Design Concepts**

#### 🔍 **Search & Filter Architecture**
```typescript
SearchBar<T extends SearchableItem>
├── Generic Type Support: Works with any data structure
├── Debounced Input: Performance optimization
├── Hierarchical Search: Searches through nested tree structures
├── Visual Highlighting: Real-time search term highlighting
└── State Management: Communicates search state to parent components
```

#### 🌳 **Enhanced Generic TreeList Architecture**
```typescript
TreeList<TreeNodeType = CategoryNode | GeographyNode>
├── Union Type Support: Single component handles multiple data types
├── Type Guards: Runtime type detection (isCategoryNode, isGeographyNode)
├── Generic Helpers: getNodeKey(), getNodeName(), getNodeChildren(), getCanSelectSubItems()
├── Enhanced Props Interface: New generic props + backward compatibility
├── Smart Prop Selection: Dynamic prop selection based on nodeType
├── Function Aliases: Support for both "Category" and "Item" naming conventions
├── Recursive Rendering: Handles nested hierarchical data for both types
├── Selection Management: Multi-select with parent-child relationships
├── Expansion Control: Configurable initial expansion per type
├── Search Integration: Auto-expansion of matching nodes
├── Event Broadcasting: Unified event handling for both data types
└── Merged Architecture: Consolidated tree-list-generic.tsx functionality
```

#### 🔧 **Component Wrapper Pattern**
```typescript
Category Component (Wrapper)
├── TreeList Integration: Uses generic TreeList with nodeType="category"
├── SearchBar Integration: Category-specific search configuration
├── Default Behavior: Initially expanded (initiallyExpanded={true})
└── Data Source: MockCategoryHierarchyData

Geography Component (Wrapper)  
├── TreeList Integration: Uses generic TreeList with nodeType="geography"
├── SearchBar Integration: Geography-specific search configuration
├── Default Behavior: Initially collapsed (initiallyExpanded={false})
└── Data Source: MockGeographyHierarchyData
```

#### 🧙‍♂️ **Wizard Pattern**
```typescript
Multi-Step Wizard
├── Step Management: Current step tracking and validation
├── Context-Aware Navigation: Buttons adapt to current step
├── Progress Indication: Visual feedback of current position
├── State Persistence: Selections maintained across steps
└── Validation Gates: Prevent progression without selections
```

## 🔄 Data Flow

### **1. Application Initialization**
```
App.tsx
├── useState: selectedCategories = []
├── useState: selectedGeographies = []  
├── useState: currentStep = 'category'
└── Renders: Category + SelectionWizard
```

### **2. Category Selection Flow (via Generic TreeList)**
```
User Interaction in Category Component
    ↓
TreeList Component (nodeType="category")
    ↓
Generic helper functions (getNodeName, getNodeKey)
    ↓
onSelectionChange(newSelections)
    ↓
setSelectedCategories(newSelections)
    ↓
App State Updated
    ↓
SelectionWizard Re-renders
    ↓
Visual Feedback Updated
```

### **2.1. Geography Selection Flow (via Generic TreeList)**
```
User Interaction in Geography Component
    ↓
TreeList Component (nodeType="geography")
    ↓
Generic helper functions (getNodeName, getNodeKey)
    ↓
onSelectionChange(newSelections)
    ↓
setSelectedGeographies(newSelections)
    ↓
App State Updated
    ↓
SelectionWizard Re-renders
    ↓
Visual Feedback Updated
```

### **3. Search Flow (Generic for Both Types)**
```
User Types in SearchBar (Category or Geography)
    ↓
Debounced Input
    ↓
filterNodes(searchQuery)
    ↓
onFilteredDataChange(filteredData)
    ↓
TreeList Receives Filtered Data (TreeNodeType[])
    ↓
Type Guards Determine Node Type
    ↓
Auto-expand Matching Nodes
    ↓
Highlight Search Terms (Generic)
```

### **4. Navigation Flow**
```
User Clicks Next
    ↓
Validate Current Selections
    ↓
If Valid: onNextStep()
    ↓
setCurrentStep('geography')
    ↓
App Renders Geography Component (with TreeList)
    ↓
SelectionWizard Updates Context
```

### **5. Selection Synchronization Flow (Generic)**
```
Component Mounts/Props Change
    ↓
useEffect([actualSelectedItems]) // Generic selected items
    ↓
Type Guards Determine Node Type
    ↓
Sync Internal Selection State
    ↓
Update Visual Checkboxes
    ↓
Update Select All State
    ↓
Maintain UI Consistency
```

## 📁 Project Structure

```
src/
├── components/
│   ├── category/
│   │   ├── category.tsx              # Category wrapper using generic TreeList
│   │   └── category.css              # Category-specific styles
│   ├── geography/
│   │   ├── geography.tsx             # Geography wrapper using generic TreeList
│   │   └── geography.css             # Geography-specific styles
│   ├── tree-list/
│   │   ├── tree-list.tsx             # Unified generic tree component (CategoryNode | GeographyNode)
│   │   └── tree-list.css             # Tree styling
│   ├── selectionwizard/
│   │   ├── selectionwizard.tsx       # Selection management panel
│   │   └── selection-wizard.css      # Wizard styling
│   └── genericsearch/
│       ├── searchbar.tsx             # Generic search component
│       ├── searchbar.css             # Search styling
│       ├── usage-examples.tsx        # Usage documentation
│       └── index.ts                  # Module exports
├── models/
│   ├── category-tree.ts              # CategoryNode interface
│   └── geography-tree.ts             # GeographyNode interface
├── core/
│   └── mock/
│       └── data/
│           ├── mock-category-data.tsx # Sample category data
│           └── mock-geography-data.tsx # Sample geography data
├── App.tsx                           # Main application component
├── App.css                           # Global application styles
└── index.tsx                         # Application entry point
```

## 🧩 Core Components

### **1. App.tsx - Main Controller**
**Purpose**: Central state management and step orchestration

**Key Responsibilities**:
- Manages selection state for categories and geographies
- Controls current wizard step
- Provides navigation functions
- Renders appropriate step component

**State Management**:
```typescript
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
const [selectedGeographies, setSelectedGeographies] = useState<string[]>([]);
const [currentStep, setCurrentStep] = useState<'category' | 'geography'>('category');
```

**Navigation Logic**:
```typescript
const handleNextStep = () => {
  if (currentStep === 'category') {
    setCurrentStep('geography');
  }
};

const handlePreviousStep = () => {
  if (currentStep === 'geography') {
    setCurrentStep('category');
  }
};
```

### **2. SearchBar<T> - Generic Search Component**
**Purpose**: Reusable search functionality for any hierarchical data

**Key Features**:
- **Type-Safe Generics**: Works with any data structure
- **Flexible Search**: Field-based or custom function search
- **Debounced Input**: Performance optimization
- **Hierarchical Support**: Searches through nested structures

**Configuration Options**:
```typescript
interface SearchBarProps<T> {
  data: T[];                                    // Data to search
  searchField: keyof T | ((item: T) => string); // Search strategy
  childrenField?: keyof T;                      // For hierarchical data
  onFilteredDataChange: (filtered: T[]) => void; // Results callback
  debounceMs?: number;                          // Search delay
  minSearchLength?: number;                     // Minimum chars to search
}
```

**Implementation Example**:
```typescript
<SearchBar<GeographyNode>
  data={MockGeographyHierarchyData}
  onFilteredDataChange={handleFilteredDataChange}
  onSearchStateChange={handleSearchStateChange}
  placeholder="Search geographies..."
  searchField="geographyName"
  childrenField="geographies"
/>
```

### **3. Generic TreeList Architecture**
**Purpose**: Unified hierarchical data visualization supporting multiple node types

**Core Architecture**: 
The TreeList component now uses a generic approach to handle both CategoryNode and GeographyNode data types through:

```typescript
// Union type supporting multiple node types
type TreeNodeType = CategoryNode | GeographyNode;

// Type guards for runtime type detection
const isCategoryNode = (node: TreeNodeType): node is CategoryNode => {
  return 'productName' in node && 'categories' in node;
};

const isGeographyNode = (node: TreeNodeType): node is GeographyNode => {
  return 'geographyName' in node && 'geographies' in node;
};

// Complete set of generic helper functions for node operations
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
```

**TreeList Component Props Interface**:
```typescript
export interface TreeListProps {
  data?: TreeNodeType[];
  heading?: string;
  showSelectAllButton?: boolean;
  
  // Generic props for unified selection handling
  selectedItems?: string[];
  setSelectedItems?: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Specific props for backward compatibility
  selectedCategories?: string[];
  setSelectedCategories?: React.Dispatch<React.SetStateAction<string[]>>;
  selectedGeographies?: string[];
  setSelectedGeographies?: React.Dispatch<React.SetStateAction<string[]>>;
  
  isSearching?: boolean;
  searchQuery?: string;
  initiallyExpanded?: boolean;
  nodeType?: 'category' | 'geography';
}
```

**Flexible Prop Selection**:
```typescript
// TreeList automatically selects the appropriate props based on context
const actualSelectedItems = selectedItems && selectedItems.length > 0 
  ? selectedItems 
  : (nodeType === 'category' ? selectedCategories : selectedGeographies);
  
const actualSetSelectedItems = setSelectedItems 
  || (nodeType === 'category' ? setSelectedCategories : setSelectedGeographies);
```
```

**Generic Component Features**:
- **Unified Logic**: Single component handles both data types
- **Type-Safe Operations**: TypeScript type guards ensure safe property access
- **Configurable Behavior**: Different initial expansion per node type
- **Event Handling**: Supports both category and geography events
- **Recursive Rendering**: Handles unlimited nesting levels for any node type
- **Multi-Selection**: Checkbox-based selection with visual feedback
- **Expansion Control**: Collapsible nodes with smooth animations
- **Search Integration**: Auto-expansion and highlighting for both types
- **Bulk Operations**: Select All / Clear All functionality

**Component Wrapper Pattern**:

**Category Component (Wrapper)**:
```typescript
<TreeList
  data={filteredData}
  heading="Select Categories"
  selectedCategories={selectedCategories}
  setSelectedCategories={setSelectedCategories}
  isSearching={isSearching}
  searchQuery={searchQuery}
  initiallyExpanded={true}  // Categories start expanded
  nodeType="category"
/>
```

**Geography Component (Wrapper)**:
```typescript
<TreeList
  data={filteredData}
  heading="Select Geographies"
  selectedGeographies={selectedGeographies}
  setSelectedGeographies={setSelectedGeographies}
  isSearching={isSearching}
  searchQuery={searchQuery}
  initiallyExpanded={false}  // Geographies start collapsed
  nodeType="geography"
/>
```

**Key Benefits of Generic Architecture**:
- **Code Reusability**: Single component handles both category and geography trees
- **Maintainability**: Changes to tree logic only need to be made in one place
- **Type Safety**: TypeScript ensures correct property access for each node type
- **Consistency**: Uniform behavior across different data types
- **Backward Compatibility**: Existing implementations continue to work
- **Flexible Props**: Support for both generic and specific prop patterns
- **Smart Selection**: Automatic prop selection based on context
- **Extensibility**: Easy to add new node types by extending the union type

**Selection State Synchronization (Generic)**:
```typescript
// Generic synchronization logic that works for both CategoryNode and GeographyNode
useEffect(() => {
  if (data) {
    const newSelection: SelectionMap = {};
    
    // Generic helper function to mark selected nodes
    const markSelectedNodes = (nodes: TreeNodeType[]) => {
      nodes.forEach((node) => {
        const nodeKey = getNodeKey(node);
        const nodeName = getNodeName(node);
        const isSelected = actualSelectedItems.includes(nodeName);
        
        if (isSelected) {
          newSelection[nodeKey] = true;
        }
        
        // Recursively check children using generic helper
        const children = getNodeChildren(node);
        if (Array.isArray(children) && children.length > 0) {
          markSelectedNodes(children);
        }
      });
    };
    
    markSelectedNodes(data);
    setSelection(newSelection);
  }
}, [actualSelectedItems, data]);

// actualSelectedItems automatically selected based on props and nodeType
```

### **4. SelectionWizard - Selection Management Panel**
**Purpose**: Context-aware selection management and navigation

**Key Features**:
- **Collapsible Sections**: Separate areas for different selection types
- **Context Awareness**: Expands current step's section
- **Real-time Feedback**: Shows selection counts and validation state
- **Navigation Controls**: Step-aware buttons with validation
- **Selection Management**: Individual item removal and bulk clearing

**Collapsible Section Logic**:

The SelectionWizard uses conditional rendering to create collapsible sections that expand based on the current wizard step:

```typescript
// Section header with dynamic CSS classes
<div className={`section-header ${currentStep === 'category' ? 'expanded' : 'collapsed'}`}>
  <span className="section-name">Categories ({selectedCategories.length})</span>
</div>

// Show full list when current step matches
{currentStep === 'category' && (
  <div className="selection-list">
    {selectedCategories.map(category => (
      <div className="selection-item">{category}</div>
    ))}
  </div>
)}

// Show summary when step doesn't match
{currentStep !== 'category' && (
  <div className="collapsed-summary">
    {selectedCategories.length} items selected
  </div>
)}
```

**Key Concepts**:
- **Conditional Rendering**: Use `currentStep` to show/hide content
- **Dynamic CSS Classes**: Apply different styles based on expansion state
- **Context Awareness**: Expand relevant section automatically
- **Visual Feedback**: Different views for expanded vs collapsed states

## 💡 Current Usage Patterns

### **Category Component Implementation**
```typescript
// Category component using TreeList with category-specific configuration
<TreeList
  data={filteredData}
  heading="Select Categories"
  selectedCategories={selectedCategories}
  setSelectedCategories={setSelectedCategories}
  isSearching={isSearching}
  searchQuery={searchQuery}
  initiallyExpanded={true}  // Categories start expanded
  nodeType="category"
/>
```

### **Geography Component Implementation**
```typescript
// Geography component using TreeList with geography-specific configuration
<TreeList
  data={filteredData}
  heading="Select Geographies"
  selectedGeographies={selectedGeographies}
  setSelectedGeographies={setSelectedGeographies}
  isSearching={isSearching}
  searchQuery={searchQuery}
  initiallyExpanded={false}  // Geographies start collapsed
  nodeType="geography"
/>
```

### **Generic Usage Pattern**
```typescript
// Generic approach for new implementations
<TreeList
  data={currentData}
  heading={`Select ${nodeType === 'category' ? 'Categories' : 'Geographies'}`}
  selectedItems={selectedItems}
  setSelectedItems={setSelectedItems}
  nodeType={nodeType}
  initiallyExpanded={nodeType === 'category'}
/>
```

### **SearchBar Integration**
```typescript
// Category SearchBar
<SearchBar<CategoryNode>
  data={MockCategoryHierarchyData}
  onFilteredDataChange={handleFilteredDataChange}
  onSearchStateChange={handleSearchStateChange}
  placeholder="Search categories..."
  searchField="productName"
  childrenField="categories"
/>

// Geography SearchBar
<SearchBar<GeographyNode>
  data={MockGeographyHierarchyData}
  onFilteredDataChange={handleFilteredDataChange}
  onSearchStateChange={handleSearchStateChange}
  placeholder="Search geographies..."
  searchField="geographyName"
  childrenField="geographies"
/>
```

## 🎯 Key Features

### **🔍 Advanced Search Capabilities**

#### **Multi-Field Search**
```typescript
// Example: Search across multiple fields
searchField={(product) => `${product.title} ${product.description} ${product.category}`}
```

#### **Hierarchical Search**
- Searches through parent and child nodes
- Auto-expands nodes containing matches
- Highlights search terms in results
- Preserves tree structure in results

#### **Smart Filtering**
- **Direct Matches**: Items containing search terms
- **Parent Matches**: Parents of matching children
- **Visual Indicators**: Different styling for match types

### **🌳 Intelligent Tree Management**

#### **Expansion Strategies (Generic TreeList)**
- **Category Tree**: Auto-expand root nodes for immediate visibility (`initiallyExpanded={true}`)
- **Geography Tree**: Start collapsed to reduce information overload (`initiallyExpanded={false}`)
- **Search Mode**: Auto-expand matching branches in both components
- **Configurable**: Expansion behavior controlled via props

**Implementation**:
```typescript
// Generic TreeList: Configurable expansion
useEffect(() => {
  if (data) {
    setExpanded((prevExpanded) => {
      const newExpanded: SelectionMap = { ...prevExpanded };
      data.forEach((node) => {
        const nodeKey = getNodeKey(node);
        if (!(nodeKey in newExpanded)) {
          newExpanded[nodeKey] = initiallyExpanded; // Configurable per wrapper
        }
      });
      return newExpanded;
    });
  }
}, [data, initiallyExpanded]);

// Category Component: Uses TreeList with initiallyExpanded={true}
<TreeList
  data={filteredData}
  nodeType="category"
  initiallyExpanded={true}  // Categories auto-expand
  // ... other props
/>

// Geography Component: Uses TreeList with initiallyExpanded={false}
<TreeList
  data={filteredData}
  nodeType="geography"
  initiallyExpanded={false}  // Geographies start collapsed
  // ... other props
/>
```

#### **Selection Persistence**
- Maintains selections when navigating between steps
- Syncs visual state with selection data
- Preserves expansion state where appropriate

### **🧙‍♂️ Smart Wizard Navigation**

#### **Context-Aware Controls**
```typescript
// Category Step
{currentStep === 'category' && (
  <button 
    className="wizard-btn wizard-btn-primary" 
    onClick={onNextStep}
    disabled={selectedCategories.length === 0}
  >
    Next →
  </button>
)}

// Geography Step  
{currentStep === 'geography' && (
  <button 
    className="wizard-btn wizard-btn-success" 
    onClick={() => console.log('Wizard completed!', { selectedCategories, selectedGeographies })}
    disabled={selectedGeographies.length === 0}
  >
    Complete
  </button>
)}
```

#### **Visual Feedback**
- **Disabled State**: Gray buttons when no selections
- **Enabled State**: Blue/green buttons when ready to proceed
- **Progress Indication**: Clear step indicators

## 🛠 Technical Implementation

### **TypeScript Interfaces**

#### **CategoryNode Structure**
```typescript
export interface CategoryNode {
  productID: number | null;
  productName: string;
  parentProductID: number | null;
  hasChildren: boolean;
  categoryID: number | null;
  isEnabled: boolean;
  canSelectsubcategories: boolean;
  level1Group: string | null;
  level2Group: string | null;
  isLowestLevel: boolean;
  parentName?: string | null;
  categories: CategoryNode[];
  definition?: string | null;
}
```

#### **GeographyNode Structure**
```typescript
export interface GeographyNode {
  geographyID: number | null;
  geographyName: string;
  parentGeographyID: number | null;
  hasChildren: boolean;
  isEnabled: boolean;
  canSelectSubGeographies: boolean;
  level1Group: string | null;
  level2Group: string | null;
  isLowestLevel: boolean;
  parentName?: string | null;
  geographies: GeographyNode[];
  definition?: string | null;
}
```

### **Generic TreeList Architecture Benefits**

#### **🔄 Code Reusability & Maintainability**
- **Single Source of Truth**: One TreeList component handles all hierarchical data
- **DRY Principle**: Eliminates duplication between category and geography trees
- **Centralized Logic**: Tree operations, selection, and expansion logic in one place
- **Easy Updates**: Changes to tree behavior automatically apply to both data types

#### **🛡️ Type Safety & Reliability**
- **TypeScript Generics**: Compile-time type checking for all operations
- **Type Guards**: Runtime type detection prevents property access errors
- **Union Types**: Safe handling of multiple data structures
- **Interface Contracts**: Clear contracts between components

#### **⚡ Performance Benefits**
- **Unified Rendering**: Single optimized rendering pipeline for both types
- **Consistent State Management**: Shared state logic reduces complexity
- **Memory Efficiency**: No duplicate component instances or logic
- **Optimized Re-renders**: Generic useEffect dependencies work for both types

#### **🔧 Development Experience**
- **Consistent APIs**: Same props interface for both category and geography
- **Predictable Behavior**: Uniform interaction patterns across data types
- **Easy Debugging**: Single component to debug for tree-related issues
- **Clear Separation**: Wrapper components provide clear boundaries

#### **📈 Extensibility & Future-Proofing**
- **Easy New Types**: Add new node types by extending TreeNodeType union
- **Scalable Architecture**: Generic helpers can be extended for new properties
- **Flexible Configuration**: Props-based customization for different behaviors
- **Component Composition**: Wrapper pattern allows specific customizations

### **State Management Patterns**

#### **Centralized State**
```typescript
// All selection state managed in App.tsx
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
const [selectedGeographies, setSelectedGeographies] = useState<string[]>([]);
```

#### **Props-Based Communication**
```typescript
// Components receive state and updaters as props
<TreeList 
  selectedCategories={selectedCategories}
  setSelectedCategories={setSelectedCategories}
  onSelectionChange={handleSelectionChange}
/>
```

#### **Event-Driven Updates**
```typescript
// Components communicate through callback props
const handleSelectionChange = (newSelections: string[]) => {
  setSelectedCategories(newSelections);
};
```

### **Performance Optimizations**

#### **Debounced Search**
```typescript
// Prevents excessive API calls/filtering
useEffect(() => {
  const timeoutId = setTimeout(() => {
    performSearch(searchQuery);
  }, debounceMs);
  
  return () => clearTimeout(timeoutId);
}, [searchQuery, debounceMs]);
```

#### **Memoization Strategy**
- Component re-renders only when relevant props change
- Search results cached until query changes
- Tree expansion state preserved across renders

#### **Event-Based Communication**
```typescript
// Category component communicates with SelectionWizard via events
const handleRemoveCategory = (categoryToRemove: string) => {
  setSelectedCategories(prev => prev.filter(cat => cat !== categoryToRemove));
  
  const event = new CustomEvent('categorySelectionChanged', {
    detail: {
      categoryName: categoryToRemove,
      selected: false,
      updateNode: true
    }
  });
  
  window.dispatchEvent(event);
};

// Geography component communicates with SelectionWizard via events
const handleRemoveGeography = (geographyToRemove: string) => {
  setSelectedGeographies(prev => prev.filter(geo => geo !== geographyToRemove));
  
  const event = new CustomEvent('geographySelectionChanged', {
    detail: {
      geographyName: geographyToRemove,
      selected: false,
      updateNode: true
    }
  });
  
  window.dispatchEvent(event);
};
```

## 📚 Usage Examples

### **Basic Category Selection**
```typescript
<SearchBar<CategoryNode>
  data={categoryData}
  onFilteredDataChange={setFilteredData}
  placeholder="Search categories..."
  searchField="productName"
  childrenField="categories"
/>
```

### **Advanced Geography Search**
```typescript
<SearchBar<GeographyNode>
  data={geographyData}
  onFilteredDataChange={setFilteredData}
  placeholder="Search countries and regions..."
  searchField="geographyName"
  childrenField="geographies"
  minSearchLength={2}
  debounceMs={500}
/>
```

### **Custom Multi-Field Search**
```typescript
<SearchBar<Product>
  data={products}
  onFilteredDataChange={setFilteredProducts}
  searchField={(product) => `${product.name} ${product.category} ${product.brand}`}
  placeholder="Search products..."
/>
```

### **Tree Component with Selection**
```typescript
// Category Component (using generic TreeList)
<TreeList
  data={filteredData}
  heading="Select Categories"
  showSelectAllButton={true}
  selectedCategories={selectedCategories}
  setSelectedCategories={setSelectedCategories}
  isSearching={isSearching}
  searchQuery={searchQuery}
  nodeType="category"
  initiallyExpanded={true}
/>

// Geography Component (using generic TreeList)
<TreeList
  data={filteredData}
  heading="Select Geographies"
  showSelectAllButton={true}
  selectedGeographies={selectedGeographies}
  setSelectedGeographies={setSelectedGeographies}
  isSearching={isSearching}
  searchQuery={searchQuery}
  nodeType="geography"
  initiallyExpanded={false}
/>
```

### **Complete Wizard Setup**

Setting up the complete wizard involves three main parts:

**1. State Management**:
```typescript
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
const [selectedGeographies, setSelectedGeographies] = useState<string[]>([]);
const [currentStep, setCurrentStep] = useState<'category' | 'geography'>('category');
```

**2. Conditional Step Rendering**:
```typescript
// Both Category and Geography components use the same generic TreeList internally
{currentStep === 'category' && <Category {...categoryProps} />}
{currentStep === 'geography' && <Geography {...geographyProps} />}
```

**3. Selection Wizard Integration**:
```typescript
<SelectionWizard 
  selectedCategories={selectedCategories}
  selectedGeographies={selectedGeographies}
  currentStep={currentStep}
  onNextStep={handleNextStep}
  onPreviousStep={handlePreviousStep}
/>
```

**Key Setup Concepts**:
- **State Centralization**: All wizard state managed in App component
- **Step-Based Rendering**: Show only current step's component
- **Unified Architecture**: Both Category and Geography use the same generic TreeList
- **Prop Passing**: Pass state and handlers to child components
- **Navigation Control**: Wizard handles step transitions

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14 or higher)
- npm or yarn
- TypeScript knowledge
- React familiarity

### **Installation**
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd extracator

# Install dependencies
npm install

# Start development server
npm start
```

### **Development Setup**
```bash
# Install TypeScript globally (if not already installed)
npm install -g typescript

# Verify installation
tsc --version

# Run type checking
npm run type-check

# Build for production
npm run build
```

### **Basic Usage Flow**
1. **Start Application**: Navigate to `http://localhost:3000`
2. **Select Categories**: Browse and select from the category tree
3. **Search Categories**: Use search bar to filter categories
4. **Navigate**: Click "Next" to proceed to geography selection
5. **Select Geographies**: Choose countries/regions from the geography tree
6. **Search Geographies**: Filter by geography names
7. **Review Selections**: Check selections in the wizard panel
8. **Complete**: Finish the wizard process

### **Customization Guide**

#### **Adding New Data Sources**
```typescript
// Replace mock data with API calls
const fetchCategories = async () => {
  const response = await fetch('/api/categories');
  return response.json();
};

// Use in component
useEffect(() => {
  fetchCategories().then(setCategories);
}, []);
```

#### **Extending Search Functionality**
```typescript
// Custom search logic
const customSearchFunction = (item: MyDataType) => {
  return `${item.name} ${item.description} ${item.tags.join(' ')}`;
};

<SearchBar
  data={myData}
  searchField={customSearchFunction}
  onFilteredDataChange={setFilteredData}
/>
```

#### **Adding New Wizard Steps**
```typescript
// Extend currentStep type
type WizardStep = 'category' | 'geography' | 'measures' | 'configuration';

// Add new step component
{currentStep === 'measures' && (
  <MeasuresComponent
    selectedMeasures={selectedMeasures}
    setSelectedMeasures={setSelectedMeasures}
  />
)}
```

## 📖 Learning Resources

### **React Concepts Used**
- **useState Hook**: State management in functional components
- **useEffect Hook**: Side effects and lifecycle management
- **Custom Hooks**: Reusable stateful logic
- **Component Composition**: Building complex UIs from simple components
- **Props Drilling**: Passing data through component hierarchy
- **Event Handling**: User interaction management

### **TypeScript Features**
- **Generics**: Type-safe reusable components
- **Interfaces**: Defining object shapes
- **Union Types**: Multiple possible types
- **Optional Properties**: Flexible interface definitions
- **Type Guards**: Runtime type checking

### **Advanced Patterns**
- **Compound Components**: Components that work together
- **Render Props**: Sharing code between components
- **Higher-Order Components**: Component logic reuse
- **Context API**: Global state management
- **Custom Events**: Cross-component communication

### **Performance Best Practices**
- **Debouncing**: Reducing API calls and computations
- **Memoization**: Preventing unnecessary re-renders
- **Lazy Loading**: Loading components on demand
- **Virtual Scrolling**: Handling large datasets
- **Bundle Splitting**: Optimizing load times

### **CSS Techniques**
- **Flexbox**: Layout management
- **CSS Grid**: Complex layouts
- **CSS Variables**: Dynamic theming
- **Responsive Design**: Mobile-first approach
- **CSS Modules**: Scoped styling

### **Testing Strategies**
```typescript
// Unit Testing Example
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './searchbar';

test('filters data based on search input', () => {
  const mockData = [{ name: 'Apple' }, { name: 'Banana' }];
  const onFilteredDataChange = jest.fn();
  
  render(
    <SearchBar
      data={mockData}
      searchField="name"
      onFilteredDataChange={onFilteredDataChange}
    />
  );
  
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'App' } });
  
  expect(onFilteredDataChange).toHaveBeenCalledWith([{ name: 'Apple' }]);
});
```

### **Debugging Tips**
1. **React Developer Tools**: Browser extension for component inspection
2. **Console Logging**: Strategic logging for state tracking
3. **TypeScript Errors**: Pay attention to type errors
4. **Network Tab**: Monitor API calls and responses
5. **Performance Tab**: Identify rendering bottlenecks

### **Deployment Considerations**
- **Environment Variables**: Configuration management
- **Build Optimization**: Bundle size reduction
- **CDN Setup**: Static asset delivery
- **Error Monitoring**: Production error tracking
- **Performance Monitoring**: Real-user metrics

### **Further Learning**
- **React Documentation**: [reactjs.org](https://reactjs.org)
- **TypeScript Handbook**: [typescriptlang.org](https://typescriptlang.org)
- **React Testing Library**: [testing-library.com](https://testing-library.com)
- **Performance Optimization**: Web Vitals and React Profiler
- **State Management**: Redux, Zustand, or Context API patterns

## 🎯 Benefits & Advantages

### **For Developers**
- **Reusable Components**: Generic search and tree components work across projects
- **Type Safety**: Full TypeScript support prevents runtime errors
- **Maintainable Code**: Clear separation of concerns and modular design
- **Extensible Architecture**: Easy to add new steps or selection types
- **Performance Optimized**: Debounced search and efficient rendering
- **Well Documented**: Comprehensive code comments and documentation

### **For Users**
- **Intuitive Interface**: Clear visual hierarchy and navigation
- **Efficient Search**: Fast, responsive search with smart highlighting
- **Context Awareness**: Always know where you are in the process
- **Flexible Selection**: Easy to manage and modify selections
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Keyboard navigation and screen reader support

### **For Business**
- **Scalable Solution**: Handles large datasets efficiently
- **Professional UI**: Modern, clean interface design
- **Customizable**: Easy to brand and customize for different needs
- **Cross-Browser**: Compatible with all modern browsers
- **SEO Friendly**: Proper semantic HTML structure
- **Analytics Ready**: Easy to integrate tracking and metrics

### **Architecture Benefits**
- **Component Isolation**: Each component has a single responsibility
- **Unified Tree Architecture**: Both Category and Geography components use the same generic TreeList
- **Testable Code**: Components are easy to unit test
- **Reusable Logic**: Generic TreeList handles all hierarchical data visualization
- **Type Safety**: Prevents common JavaScript errors
- **Performance**: Optimized for large datasets and frequent interactions
- **Consistent Patterns**: Both Category and Geography follow identical architectural approaches

---

## 📞 Support & Contributing

### **Getting Help**
- Check existing documentation and examples
- Review TypeScript interfaces for proper usage
- Examine console logs for debugging information
- Test with smaller datasets to isolate issues

### **Contributing Guidelines**
- Follow TypeScript best practices
- Maintain component isolation
- Add comprehensive comments
- Include usage examples for new features
- Update documentation for changes

### **Code Standards**
- Use meaningful variable and function names
- Follow React hooks best practices
- Implement proper error handling
- Maintain consistent code formatting
- Write self-documenting code

---

**Built with React, TypeScript, and modern web development best practices.**

**This documentation serves as both a technical reference and learning guide for the React Extractor UI project.**