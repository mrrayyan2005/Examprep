import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

export interface MonthlyPlan {
  id: string;
  subject: string;
  target: string;
  deadline: string;
  completed: boolean;
  createdAt: string;
}

interface MonthlyPlanState {
  plans: MonthlyPlan[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MonthlyPlanState = {
  plans: [],
  isLoading: false,
  error: null,
};

export const fetchMonthlyPlans = createAsyncThunk(
  'monthlyPlans/fetchMonthlyPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/goals/monthly');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly plans');
    }
  }
);

export const addMonthlyPlan = createAsyncThunk(
  'monthlyPlans/addMonthlyPlan',
  async (planData: Omit<MonthlyPlan, 'id' | 'createdAt' | 'completed'>, { rejectWithValue }) => {
    try {
      // Transform frontend data to backend format
      const currentDate = new Date();
      const backendData = {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        subject: planData.subject,
        targetType: 'chapters',
        targetAmount: 1,
        deadline: planData.deadline,
        description: planData.target,
        priority: 'Medium'
      };
      
      const response = await axiosInstance.post('/goals/monthly', backendData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add plan');
    }
  }
);

export const updateMonthlyPlan = createAsyncThunk(
  'monthlyPlans/updateMonthlyPlan',
  async ({ id, data }: { id: string; data: Partial<MonthlyPlan> }, { rejectWithValue }) => {
    try {
      // Transform data if needed
      const backendData: any = {};
      if (data.completed !== undefined) {
        backendData.status = data.completed ? 'Completed' : 'Not Started';
      }
      if (data.subject) backendData.subject = data.subject;
      if (data.target) backendData.description = data.target;
      if (data.deadline) backendData.deadline = data.deadline;
      
      const response = await axiosInstance.put(`/goals/monthly/${id}`, backendData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update plan');
    }
  }
);

export const deleteMonthlyPlan = createAsyncThunk(
  'monthlyPlans/deleteMonthlyPlan',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/goals/monthly/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete plan');
    }
  }
);

const monthlyPlanSlice = createSlice({
  name: 'monthlyPlans',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyPlans.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMonthlyPlans.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Transform backend data to frontend format
        const backendPlans = action.payload.data || action.payload;
        state.plans = backendPlans.map((plan: any) => ({
          id: plan._id || plan.id,
          subject: plan.subject,
          target: plan.description || plan.target || '',
          deadline: plan.deadline,
          completed: plan.status === 'Completed',
          createdAt: plan.createdAt
        }));
      })
      .addCase(fetchMonthlyPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addMonthlyPlan.fulfilled, (state, action: PayloadAction<any>) => {
        const backendPlan = action.payload.data || action.payload;
        const frontendPlan = {
          id: backendPlan._id || backendPlan.id,
          subject: backendPlan.subject,
          target: backendPlan.description || '',
          deadline: backendPlan.deadline,
          completed: backendPlan.status === 'Completed',
          createdAt: backendPlan.createdAt
        };
        state.plans.push(frontendPlan);
      })
      .addCase(updateMonthlyPlan.fulfilled, (state, action: PayloadAction<any>) => {
        const backendPlan = action.payload.data || action.payload;
        const frontendPlan = {
          id: backendPlan._id || backendPlan.id,
          subject: backendPlan.subject,
          target: backendPlan.description || '',
          deadline: backendPlan.deadline,
          completed: backendPlan.status === 'Completed',
          createdAt: backendPlan.createdAt
        };
        const index = state.plans.findIndex((plan) => plan.id === frontendPlan.id);
        if (index !== -1) {
          state.plans[index] = frontendPlan;
        }
      })
      .addCase(deleteMonthlyPlan.fulfilled, (state, action: PayloadAction<string>) => {
        state.plans = state.plans.filter((plan) => plan.id !== action.payload);
      });
  },
});

export const { clearError } = monthlyPlanSlice.actions;
export default monthlyPlanSlice.reducer;
