// Match the enum from the database
export enum CanvasEntityType {
  HTML = "html",
  TEXT = "text",
  URL = "url",
  SCRIBBLE = "scribble",
  IMAGE = "image",
}

export const getEntityTypeLabel = (type: CanvasEntityType): string => {
  switch (type) {
    case CanvasEntityType.HTML:
      return "HTML";
    case CanvasEntityType.TEXT:
      return "Text";
    case CanvasEntityType.URL:
      return "URL";
    case CanvasEntityType.SCRIBBLE:
      return "Scribble";
    case CanvasEntityType.IMAGE:
      return "Image";
    default:
      return "Unknown";
  }
};

export const getDefaultEntitySize = (
  type: CanvasEntityType,
): { width: number; height: number } => {
  switch (type) {
    case CanvasEntityType.HTML:
      return { width: 800, height: 600 };
    case CanvasEntityType.TEXT:
      return { width: 200, height: 100 };
    case CanvasEntityType.URL:
      return { width: 400, height: 300 };
    case CanvasEntityType.SCRIBBLE:
      return { width: 300, height: 200 };
    case CanvasEntityType.IMAGE:
      return { width: 300, height: 200 };
    default:
      return { width: 200, height: 200 };
  }
};
