import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role: string;
      tower: string;
      villamentNumber: string;
      flatNumber: string;
      status: string;
      approvedOn: string;
      profileComplete: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    tower?: string;
    villamentNumber?: string;
    flatNumber?: string;
    status?: string;
    approvedOn?: string;
    profileComplete?: boolean;
  }
}
