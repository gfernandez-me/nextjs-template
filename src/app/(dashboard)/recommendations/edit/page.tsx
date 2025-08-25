import { getHeroes, getStatTypes } from "./data/actions";
import { RecommendationForm } from "./components/recommendation-form";

export default async function RecommendationEditPage() {
  const [heroes, statTypes] = await Promise.all([getHeroes(), getStatTypes()]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create Recommendation</h1>
      <RecommendationForm heroes={heroes} statTypes={statTypes} />
    </div>
  );
}
