export interface Change {
  type: string;
  path: string;
  pathArray: string[];
  oldValue: any;
  newValue: any;
  timestamp: number;
}

export interface Node {
  type: string;
  attrs?: Record<string, any>;
  content?: Node[];
  marks?: Mark[];
  text?: string;
  _isDeleted?: boolean;
  _isAdded?: boolean;
}

export interface Mark {
  type: string;
  attrs?: Record<string, any>;
}

export interface ChangeMap extends Map<string, Change> {} 