export type Category =
  "Fiction" | "Non-Fiction" | "Self-Help" | "Romance" | "Children" | "Classics";

export interface Book {
  id: string;
  title: string;
  author: string;
  authorId: string;
  price: number;
  originalPrice?: number;
  category: Category;
  rating: number;
  reviewCount: number;
  coverImage: string;
  description: string;
  isbn: string;
  publisher: string;
  publicationDate: string;
  pages: number;
  format: "Hardcover" | "Paperback";
  bestseller: boolean;
  newArrival: boolean;
  available: boolean;
}

export interface CartLine {
  bookId: string;
  quantity: number;
}
