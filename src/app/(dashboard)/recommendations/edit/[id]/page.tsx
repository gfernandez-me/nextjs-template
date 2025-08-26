import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RecommendationForm } from "../../edit/components/recommendation-form";
import { getHeroes, getStatTypes } from "../../edit/data/actions";
import { getRecommendationById } from "./data/actions";

interface EditRecommendationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecommendationPage({
  params,
}: EditRecommendationPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?reason=auth");
  }

  const { id } = await params;
  const recommendationId = parseInt(id);

  if (isNaN(recommendationId)) {
    redirect("/recommendations");
  }

  const [heroes, statTypes, recommendation] = await Promise.all([
    getHeroes(),
    getStatTypes(),
    getRecommendationById(recommendationId, session.user.id),
  ]);

  if (!recommendation) {
    redirect("/recommendations");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Recommendation</h1>
      <RecommendationForm
        heroes={heroes}
        statTypes={statTypes}
        recommendation={recommendation}
      />
    </div>
  );
}
