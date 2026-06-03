import { Providers } from '@/components/Providers';
import { auth } from '@/lib/auth';

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return <Providers session={session}>{children}</Providers>;
}
