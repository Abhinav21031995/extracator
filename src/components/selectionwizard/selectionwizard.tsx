import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './selection-wizard.css';
import type { Dispatch, SetStateAction } from 'react';

interface SelectionContext {
  temp: {
    categories: any[];
    countries: any[];
    measuredata: any[];
    configuredata: any[];
  };
}


interface SelectionWizardProps {
  selectedCategories: string[];
  setSelectedCategories?: Dispatch<SetStateAction<string[]>>;
  selectedGeographies?: string[];
  setSelectedGeographies?: Dispatch<SetStateAction<string[]>>;
  currentStep?: 'category' | 'geography';
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

const SelectionWizard: React.FC<SelectionWizardProps> = ({ 
  selectedCategories, 
  setSelectedCategories,
  selectedGeographies = [],
  setSelectedGeographies,
  currentStep = 'category',
  onNextStep,
  onPreviousStep
}) => {
  console.log('[SelectionWizard] selectedCategories:', selectedCategories);
  const navigate = useNavigate();
  const location = useLocation();

  // Define the flow for the components
  const flow = [
    'category',
    'geography',
    'measures',
    'dataconversion',
    'responsepage'
  ];

  const [filtersContext, setFiltersContext] = useState<{ selections: SelectionContext }>({
    selections: {
      temp: {
        categories: [],
        countries: [],
        measuredata: [],
        configuredata: []
      }
    }
  });

  // Initialize the current step index
  const getCurrentIndex = () => {
    const currentRoute = location.pathname.split('/')[1];
    return flow.indexOf(currentRoute);
  };

  const [currentIndex, setCurrentIndex] = useState(getCurrentIndex());

  // Update currentIndex when route changes
  useEffect(() => {
    setCurrentIndex(getCurrentIndex());
  }, [location]);

  // Remove category and notify parent component
  const handleRemoveCategory = (categoryToRemove: string) => {
    console.log('[SelectionWizard] Remove initiated:', {
      category: categoryToRemove,
      currentSelections: selectedCategories
    });
    
    if (setSelectedCategories) {
      // Step 1: Update selectedCategories state
      setSelectedCategories((prevCategories: string[]) => {
        console.log('[SelectionWizard] Updating selections:', {
          removing: categoryToRemove,
          before: prevCategories
        });
        
        const newCategories = prevCategories.filter((cat: string) => cat !== categoryToRemove);
        
        console.log('[SelectionWizard] Selection updated:', {
          after: newCategories,
          removed: categoryToRemove
        });
        
        return newCategories;
      });
      
      // Step 2: Notify TreeList to update visual state and node property
      console.log('[SelectionWizard] Preparing tree update event:', {
        category: categoryToRemove,
        newState: false
      });
      
      const event = new CustomEvent('categorySelectionChanged', {
        detail: {
          categoryName: categoryToRemove,
          selected: false,
          updateNode: true // Ensure node's selected property is updated
        }
      });
      
      console.log('[SelectionWizard] Dispatching tree update event');
      window.dispatchEvent(event);
      console.log('[SelectionWizard] Tree update event dispatched');
    } else {
      console.error('[SelectionWizard] Error: setSelectedCategories is undefined', {
        category: categoryToRemove,
        currentSelections: selectedCategories
      });
    }
  };

  // Remove geography function (similar to category removal)
  const handleRemoveGeography = (geographyToRemove: string) => {
    console.log('[SelectionWizard] Removing geography:', {
      geography: geographyToRemove,
      currentSelections: selectedGeographies
    });
    
    if (setSelectedGeographies) {
      // Step 1: Update the state
      setSelectedGeographies(prevGeographies => {
        const newGeographies = prevGeographies.filter(geo => geo !== geographyToRemove);
        console.log('[SelectionWizard] Updated geography selections:', {
          previous: prevGeographies,
          new: newGeographies,
          removed: geographyToRemove
        });
        
        return newGeographies;
      });
      
      // Step 2: Notify Geography component to update visual state and node property
      console.log('[SelectionWizard] Preparing geography tree update event:', {
        geography: geographyToRemove,
        newState: false
      });
      
      const event = new CustomEvent('geographySelectionChanged', {
        detail: {
          geographyName: geographyToRemove,
          selected: false,
          updateNode: true // Ensure node's selected property is updated
        }
      });
      
      console.log('[SelectionWizard] Dispatching geography tree update event');
      window.dispatchEvent(event);
      console.log('[SelectionWizard] Geography tree update event dispatched');
    } else {
      console.error('[SelectionWizard] Error: setSelectedGeographies is undefined', {
        geography: geographyToRemove,
        currentSelections: selectedGeographies
      });
    }
  };

  // Function to check if selections have been made
  const tempSelectionsMade = () => {
    if (currentStep === 'category') {
      return selectedCategories.length > 0;
    } else if (currentStep === 'geography') {
      return selectedCategories.length > 0 || selectedGeographies.length > 0;
    }
    return selectedCategories.length > 0;
  };

  // Clear all selections
  const handleClearAll = () => {
    console.log('[SelectionWizard] Clear all initiated:', {
      currentSelections: selectedCategories,
      currentGeographies: selectedGeographies
    });
    
    // Clear categories if on category step or if categories exist
    if (setSelectedCategories && selectedCategories.length > 0) {
      setSelectedCategories([]);
      
      const categoryEvent = new CustomEvent('categoryClearAll', {
        detail: { clearAll: true }
      });
      window.dispatchEvent(categoryEvent);
    }
    
    // Clear geographies if on geography step or if geographies exist  
    if (setSelectedGeographies && selectedGeographies.length > 0) {
      setSelectedGeographies([]);
      
      const geographyEvent = new CustomEvent('geographyClearAll', {
        detail: { clearAll: true }
      });
      window.dispatchEvent(geographyEvent);
    }
    
    console.log('[SelectionWizard] Clear all events dispatched');
  };


  // Navigation functions
  const previousSelections = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      navigate(`/${flow[prevIndex]}`);
    }
  };

  const nextSelections = () => {
    if (currentIndex < flow.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      navigate(`/${flow[nextIndex]}`);
    }
  };

  // Helper functions
  const isFirstStep = () => currentIndex === 0;
  const isLastStep = () => currentIndex === flow.length - 1;

  return (
    <div className="filter-controls-right-panel">
      <div className="filter-controls">
        <div className="filter-controls-content">
          {/* Wizard Navigation */}
          <div className="wizard-navigation">
            <div className="wizard-steps">
              <div className={`wizard-step ${currentStep === 'category' ? 'active' : 'completed'}`}>
                1. Categories
              </div>
              <div className={`wizard-step ${currentStep === 'geography' ? 'active' : ''}`}>
                2. Geography
              </div>
            </div>
          </div>
          <div className="filter-controls-heading">
            <div className="header-container">
              <h2 className="section-header">Selections:</h2>
              {tempSelectionsMade() && (
                <button 
                  className="clear-all-btn"
                  onClick={() => handleClearAll()}
                  aria-label="Clear all selections"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Container for No selections made message */}
          {!tempSelectionsMade() && (
            <div className="selections-container">
              <p>No selections made.</p>
            </div>
          )}

          {/* Selection Content with Collapsible Sections */}
          {tempSelectionsMade() && (
            <div className="selections-container">
              
              {/* Categories Section */}
              {selectedCategories.length > 0 && (
                <div className="selection-section">
                  <div 
                    className={`section-header ${currentStep === 'category' ? 'expanded' : 'collapsed'}`}
                    onClick={() => {}} // Categories section always shows items, just visual indicator
                  >
                    <div className="section-title">
                      <span className={`expand-icon ${currentStep === 'category' ? 'expanded' : ''}`}>
                        ▼
                      </span>
                      <span className="section-name">Categories ({selectedCategories.length})</span>
                    </div>
                  </div>
                  
                  {currentStep === 'category' && (
                    <div className="selection-list">
                      {selectedCategories.map((category, index) => (
                        <div key={`category-${index}`} className="selection-item">
                          <span className="category-name">{category}</span>
                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveCategory(category)}
                            aria-label="Remove category"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {currentStep !== 'category' && (
                    <div className="collapsed-summary">
                      {selectedCategories.length} item{selectedCategories.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              )}

              {/* Geographies Section */}
              {selectedGeographies.length > 0 && (
                <div className="selection-section">
                  <div 
                    className={`section-header ${currentStep === 'geography' ? 'expanded' : 'collapsed'}`}
                    onClick={() => {}} // Geographies section always shows items, just visual indicator
                  >
                    <div className="section-title">
                      <span className={`expand-icon ${currentStep === 'geography' ? 'expanded' : ''}`}>
                        ▼
                      </span>
                      <span className="section-name">Geographies ({selectedGeographies.length})</span>
                    </div>
                  </div>
                  
                  {currentStep === 'geography' && (
                    <div className="selection-list">
                      {selectedGeographies.map((geography, index) => (
                        <div key={`geography-${index}`} className="selection-item">
                          <span className="category-name">{geography}</span>
                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveGeography(geography)}
                            aria-label="Remove geography"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {currentStep !== 'geography' && (
                    <div className="collapsed-summary">
                      {selectedGeographies.length} item{selectedGeographies.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              )}
              
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="wizard-buttons">
          {currentStep === 'geography' && (
            <button 
              className="wizard-btn wizard-btn-secondary" 
              onClick={onPreviousStep}
            >
              ← Back
            </button>
          )}
          
          {/* Next button - always visible but conditionally enabled */}
          {currentStep === 'category' && (
            <button 
              className="wizard-btn wizard-btn-primary" 
              onClick={onNextStep}
              disabled={selectedCategories.length === 0}
            >
              Next →
            </button>
          )}
          
          {currentStep === 'geography' && (
            <button 
              className="wizard-btn wizard-btn-success" 
              onClick={() => console.log('Wizard completed!', { selectedCategories, selectedGeographies })}
              disabled={selectedGeographies.length === 0}
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectionWizard;