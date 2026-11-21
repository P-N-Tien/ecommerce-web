export type Category = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryInput = {
  name: string;
  description: string;
  slug: string;
};
