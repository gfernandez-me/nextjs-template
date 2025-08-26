import { getHeroes, getStatTypes } from "./data/actions";
import { RecommendationForm } from "./components/recommendation-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RecommendationEditPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?reason=auth");
  }

  const [heroes, statTypes] = await Promise.all([getHeroes(), getStatTypes()]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create Recommendation</h1>
      <RecommendationForm
        heroes={heroes}
        statTypes={statTypes}
        userId={session.user.id}
      />
    </div>
  );
}
