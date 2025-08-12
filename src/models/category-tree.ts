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