declare module '*.jsx' {
  const content: any;
  export default content;
}

declare module './context/AuthContext' {
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
  export const useAuth: () => {
    user: any;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    register: (data: any) => Promise<any>;
    logout: () => void;
    updateUser: (data: any) => void;
    checkAuth: () => Promise<void>;
  };
}

declare module './pages/Login' {
  const Login: React.FC;
  export default Login;
}

declare module './pages/Register' {
  const Register: React.FC;
  export default Register;
}

declare module './pages/Dashboard' {
  const Dashboard: React.FC;
  export default Dashboard;
}

declare module './pages/Expenses' {
  const Expenses: React.FC;
  export default Expenses;
}

declare module './pages/Budgets' {
  const Budgets: React.FC;
  export default Budgets;
}

declare module './pages/Savings' {
  const Savings: React.FC;
  export default Savings;
}

declare module './pages/Analytics' {
  const Analytics: React.FC;
  export default Analytics;
}

declare module './pages/Reminders' {
  const Reminders: React.FC;
  export default Reminders;
}

declare module './pages/Challenges' {
  const Challenges: React.FC;
  export default Challenges;
}

declare module './pages/Insights' {
  const Insights: React.FC;
  export default Insights;
}

declare module './pages/Profile' {
  const Profile: React.FC;
  export default Profile;
}

declare module './components/Layout' {
  const Layout: React.FC;
  export default Layout;
}

declare module './services/api' {
  export const authAPI: any;
  export const expenseAPI: any;
  export const budgetAPI: any;
  export const savingsAPI: any;
  export const reminderAPI: any;
  export const notificationAPI: any;
  export const insightAPI: any;
  export const challengeAPI: any;
  export const dashboardAPI: any;
  const api: any;
  export default api;
}
