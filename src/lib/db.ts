// Create a simple interface for document types
export interface BaseDocument {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  monthYear?: string; // Add this property to fix TypeScript errors
}
