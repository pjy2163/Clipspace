export type ClipType = "text" | "link" | "code" | "contact" | "sensitive" | "image";

export type AppLocale = "ko" | "en";

export type WorkspaceMode = "personal" | "team";
export type WorkspaceKey = "personal" | `team:${string}`;

export type ClipSource = "paste" | "clipboard" | "manual";

export type ClipImage = {
  dataUrl: string;
  mimeType: string;
  fileName?: string;
  size?: number;
};

export type ClipNote = {
  id: string;
  text: string;
  createdAt: string;
  image?: ClipImage;
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

export type TeamBoard = {
  id: string;
  name: string;
  createdAt: string;
  accessKey?: string;
  shareToken?: string;
};
