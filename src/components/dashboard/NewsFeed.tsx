import { generateClinicalNews } from "@/actions/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewsFeed({ tenant }: { tenant: string }) {
  const news = await generateClinicalNews(tenant);

  return (
    <Card className="backdrop-blur-xl bg-teal-50/50 border-teal-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-teal-800 flex justify-between items-center">
          Clinical AI Feed
          <span className="text-[10px] bg-teal-200 px-2 py-0.5 rounded-full">IA Personalizada</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {news.map((item, index) => (
          <p key={index} className="text-sm text-slate-700 leading-relaxed border-b border-teal-100 pb-2">
            {item}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
