export type Category = {
  id: string;
  name: string;
  description: string | null;
  slug?: string;
};

export type CategoryInput = {
  name: string;
  description: string;
};
