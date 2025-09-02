export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  saldo: number;
  createdAt: string;
  updatedAt: string;
}
