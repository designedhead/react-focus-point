/**
 * Represents a focal point coordinates in percentage values (0-100)
 */
export interface FocusPoint {
    /** X coordinate in percentage (0-100) */
    x: number;
    /** Y coordinate in percentage (0-100) */
    y: number;
  }
  
  /**
   * Base props for template components
   */
  export interface TemplateProps {
    /** Optional CSS classname */
    className?: string;
  }