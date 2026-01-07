//OData helpers
export type ODataList<T> = {
  "@odata.context": string;
  value: T[];
};

// Some endpoints return a single entity shape (POST/PUT for some controllers)
export type ODataEntity<T> = {
  "@odata.context": string;
} & T;

// For DELETE endpoints returning Edm.Boolean
export type ODataBoolean = {
  "@odata.context": string;
  value: boolean;
};
