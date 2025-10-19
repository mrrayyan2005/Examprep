import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

export interface Book {
  id: string;
  title: string;
  subject: string;
  totalChapters: number;
  completedChapters: number;
  createdAt: string;
}

interface BookState {
  books: Book[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BookState = {
  books: [],
  isLoading: false,
  error: null,
};

export const fetchBooks = createAsyncThunk('books/fetchBooks', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/books');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch books');
  }
});

export const addBook = createAsyncThunk(
  'books/addBook',
  async (bookData: Omit<Book, 'id' | 'createdAt' | 'completedChapters'>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/books', { ...bookData, completedChapters: 0 });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add book');
    }
  }
);

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ id, data }: { id: string; data: Partial<Book> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/books/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update book');
    }
  }
);

export const deleteBook = createAsyncThunk('books/deleteBook', async (id: string, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/books/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete book');
  }
});

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBooks.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Handle different API response formats and map _id to id
        const booksData = Array.isArray(action.payload) 
          ? action.payload 
          : Array.isArray(action.payload?.data) 
            ? action.payload.data 
            : [];
            
        state.books = booksData.map((book: any) => ({
          ...book,
          id: book._id || book.id // Map MongoDB _id to id
        }));
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addBook.fulfilled, (state, action: PayloadAction<any>) => {
        const newBook = {
          ...action.payload.data || action.payload,
          id: (action.payload.data || action.payload)?._id || (action.payload.data || action.payload)?.id
        };
        state.books.push(newBook);
      })
      .addCase(updateBook.fulfilled, (state, action: PayloadAction<any>) => {
        const updatedBook = {
          ...action.payload.data || action.payload,
          id: (action.payload.data || action.payload)?._id || (action.payload.data || action.payload)?.id
        };
        const index = state.books.findIndex((book) => book.id === updatedBook.id);
        if (index !== -1) {
          state.books[index] = updatedBook;
        }
      })
      .addCase(deleteBook.fulfilled, (state, action: PayloadAction<string>) => {
        state.books = state.books.filter((book) => book.id !== action.payload);
      });
  },
});

export const { clearError } = bookSlice.actions;
export default bookSlice.reducer;
