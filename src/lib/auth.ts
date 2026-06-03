import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import {
  formatResidenceFlatNumber,
  hasCompleteResidence,
} from '@/lib/residence-options';
import { appendRow, readUsers, userToRowValues } from '@/lib/sheets';

function profileRedirect(user: { tower?: string; villamentNumber?: string; status: string }) {
  if (user.status === 'Approved' || user.status === 'Pending') {
    return true;
  }
  return `/login?status=${user.status.toLowerCase()}`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60,
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return '/login?status=rejected';
      }

      const users = await readUsers();
      const existing = users.find(
        (sheetUser) => sheetUser.email.toLowerCase() === user.email!.toLowerCase(),
      );

      if (!existing) {
        await appendRow(
          'Users',
          userToRowValues({
            email: user.email,
            name: user.name || '',
            picture: user.image || '',
            tower: '',
            villamentNumber: '',
            role: 'Resident',
            status: 'Pending',
            addedBy: 'system',
            addedOn: new Date().toISOString(),
          }),
        );
        return true;
      }

      return profileRedirect(existing);
    },
    async jwt({ token }) {
      if (!token.email) {
        return token;
      }
      const users = await readUsers();
      const existing = users.find(
        (sheetUser) => sheetUser.email.toLowerCase() === token.email!.toLowerCase(),
      );
      token.role = existing?.role || 'Resident';
      token.tower = existing?.tower || '';
      token.villamentNumber = existing?.villamentNumber || '';
      token.flatNumber =
        existing?.flatNumber ||
        formatResidenceFlatNumber(existing?.tower ?? '', existing?.villamentNumber ?? '') ||
        '';
      token.status = existing?.status || 'Pending';
      token.approvedOn = existing?.approvedOn || '';
      token.profileComplete = hasCompleteResidence(
        existing?.tower,
        existing?.villamentNumber,
      );
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) || 'Resident';
        session.user.tower = (token.tower as string) || '';
        session.user.villamentNumber = (token.villamentNumber as string) || '';
        session.user.flatNumber = (token.flatNumber as string) || '';
        session.user.status = (token.status as string) || 'Pending';
        session.user.approvedOn = (token.approvedOn as string) || '';
        session.user.profileComplete = Boolean(token.profileComplete);
      }
      return session;
    },
  },
});
