export type ClipType = "text" | "link" | "code" | "contact" | "sensitive" | "image";

export type WorkspaceMode = "personal" | "team";

export type ClipSource = "paste" | "clipboard" | "manual";

export type ClipNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type ClipImage = {
  dataUrl: string;
  mimeType: string;
  fileName?: string;
  size?: number;
};

export type Clip = {
  id: string;
  content: string;
  title: string;
  type: ClipType;
  category: string;
  createdAt: string;
  source: ClipSource;
  favorite: boolean;
  flagged: boolean;
  note?: string;
  notes?: ClipNote[];
  image?: ClipImage;
};

export type WorkspaceCopy = {
  label: string;
  title: string;
  description: string;
  empty: string;
  status: string;
};
