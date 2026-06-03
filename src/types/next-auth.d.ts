import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role: string;
      flatNumber: string;
      status: string;
      approvedOn: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    flatNumber?: string;
    status?: string;
    approvedOn?: string;
  }
}
