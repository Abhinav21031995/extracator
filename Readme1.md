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
│   └── TreeList (Category-specific)
├── Geography Component (Step 2)  
│   ├── SearchBar (Generic)
│   └── GeographyTreeList (Geography-specific)
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
- **TypeScript Generics**: Type-safe for any data structure
- **Interface-Based**: Flexible configuration through props

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

#### 🌳 **Tree Component Pattern**
```typescript
TreeList/GeographyTreeList
├── Recursive Rendering: Handles nested hierarchical data
├── Selection Management: Multi-select with parent-child relationships
├── Expansion Control: Collapsible nodes with visual indicators
├── Search Integration: Auto-expansion of matching nodes
└── Event Broadcasting: Select All, Clear All functionality
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

### **2. Category Selection Flow**
```
User Interaction
    ↓
TreeList Component
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

### **3. Search Flow**
```
User Types in SearchBar
    ↓
Debounced Input
    ↓
filterNodes(searchQuery)
    ↓
onFilteredDataChange(filteredData)
    ↓
TreeList Receives Filtered Data
    ↓
Auto-expand Matching Nodes
    ↓
Highlight Search Terms
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
App Renders Geography Component
    ↓
SelectionWizard Updates Context
```

### **5. Selection Synchronization Flow**
```
Component Mounts/Props Change
    ↓
useEffect([selectedCategories])
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
│   │   ├── category.tsx              # Category selection page
│   │   └── category.css              # Category-specific styles
│   ├── geography/
│   │   ├── geography.tsx             # Geography selection page
│   │   └── geography.css             # Geography-specific styles
│   ├── tree-list/
│   │   ├── tree-list.tsx             # Category tree component
│   │   └── tree-list.css             # Tree styling
│   ├── geography-tree-list/
│   │   ├── geography-tree-list.tsx   # Geography tree component
│   │   └── geography-tree-list.css   # Geography tree styling
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

### **3. TreeList Components**
**Purpose**: Hierarchical data visualization with selection capabilities

**Features**:
- **Recursive Rendering**: Handles unlimited nesting levels
- **Multi-Selection**: Checkbox-based selection with visual feedback
- **Expansion Control**: Collapsible nodes with smooth animations
- **Search Integration**: Auto-expansion and highlighting
- **Bulk Operations**: Select All / Clear All functionality

**Selection State Synchronization**:
```typescript
// Synchronize internal selection state with external props
useEffect(() => {
  if (data) {
    const newSelection: SelectionMap = {};
    
    const markSelectedNodes = (nodes: CategoryNode[]) => {
      nodes.forEach((node) => {
        const nodeKey = getNodeKey(node);
        const isSelected = selectedCategories.includes(node.productName);
        
        if (isSelected) {
          newSelection[nodeKey] = true;
        }
        
        if (Array.isArray(node.categories) && node.categories.length > 0) {
          markSelectedNodes(node.categories);
        }
      });
    };
    
    markSelectedNodes(data);
    setSelection(newSelection);
  }
}, [selectedCategories, data]);
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

## ✨ Key Features

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

#### **Expansion Strategies**
- **Category Tree**: Auto-expand root nodes for immediate visibility
- **Geography Tree**: Start collapsed to reduce information overload
- **Search Mode**: Auto-expand matching branches

**Implementation**:
```typescript
// Category Tree: Auto-expand
useEffect(() => {
  if (data) {
    setExpanded((prevExpanded) => {
      const newExpanded: SelectionMap = { ...prevExpanded };
      data.forEach((node) => {
        const nodeKey = getNodeKey(node);
        if (!(nodeKey in newExpanded)) {
          newExpanded[nodeKey] = true; // Auto-expand for categories
        }
      });
      return newExpanded;
    });
  }
}, [data]);

// Geography Tree: Start collapsed
useEffect(() => {
  if (data) {
    setExpanded((prevExpanded) => {
      const newExpanded: SelectionMap = { ...prevExpanded };
      data.forEach((node) => {
        const nodeKey = getNodeKey(node);
        if (!(nodeKey in newExpanded)) {
          newExpanded[nodeKey] = false; // Keep collapsed for geography
        }
      });
      return newExpanded;
    });
  }
}, [data]);
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
// SelectionWizard communicates with TreeList via events
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
<TreeList
  data={filteredData}
  heading="Select Categories"
  showSelectAllButton={true}
  selectedCategories={selectedCategories}
  setSelectedCategories={setSelectedCategories}
  isSearching={isSearching}
  searchQuery={searchQuery}
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
- **Testable Code**: Components are easy to unit test
- **Reusable Logic**: Search and tree logic can be reused
- **Type Safety**: Prevents common JavaScript errors
- **Performance**: Optimized for large datasets and frequent interactions

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