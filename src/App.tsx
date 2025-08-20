import React, { useState } from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Category from './components/category/category';
import Geography from './components/geography/geography';
import SelectionWizard from './components/selectionwizard/selectionwizard';

const App = () => {
  // Log React version only once on mount, using a ref to ensure it only logs once
  const loggedRef = React.useRef(false);
  React.useEffect(() => {
    if (!loggedRef.current) {
      console.log('[Extractor MF] React version:', React.version);
      loggedRef.current = true;
    }
  }, []);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGeographies, setSelectedGeographies] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'category' | 'geography'>('category');

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

  return (
    <BrowserRouter>
      <div className="app-layout">
        <div className="tree-container-content">
          {/* Step Content */}
          {currentStep === 'category' && (
            <Category
              heading="Select Categories"
              showSelectAllButton={true}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
          )}
          
          {currentStep === 'geography' && (
            <Geography
              selectedGeographies={selectedGeographies}
              setSelectedGeographies={setSelectedGeographies}
            />
          )}
        </div>
        
        <div className="selection-wizard-container">
          <SelectionWizard 
            selectedCategories={selectedCategories} 
            setSelectedCategories={setSelectedCategories}
            selectedGeographies={selectedGeographies}
            setSelectedGeographies={setSelectedGeographies}
            currentStep={currentStep}
            onNextStep={handleNextStep}
            onPreviousStep={handlePreviousStep}
          />
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;