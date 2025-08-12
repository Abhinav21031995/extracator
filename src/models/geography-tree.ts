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

export {};
