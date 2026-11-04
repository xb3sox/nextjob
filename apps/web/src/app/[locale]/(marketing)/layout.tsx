import { getSession } from "~/lib/auth/server";
import { Footer } from "~/modules/marketing/layout/footer/footer";
import { Header } from "~/modules/marketing/layout/header/header";

export default async function MainLayout(props: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <>
      <Header initialSession={session} />
      <main className="w-full">{props.children}</main>
      <Footer />
    </>
  );
}
