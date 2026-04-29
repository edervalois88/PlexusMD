import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import NewsFeed from "@/components/dashboard/NewsFeed";
import { getAppointmentsForToday } from "@/actions/appointment";

export default async function DoctorDashboard({ params }: { params: { tenant: string } }) {
  const { tenant } = await params;
  const appointments = await getAppointmentsForToday(tenant);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Columna Principal: Timeline de Citas */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Citas de Hoy</h2>
        <div className="space-y-4">
          {appointments.map((appt: any) => (
            <div
              key={appt.id}
              className="group border-l-4 border-slate-300 hover:border-teal-500 transition-all bg-white p-4 rounded-r-lg shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">{appt.patient.full_name}</p>
                  <p className="text-sm text-slate-500">{new Date(appt.start_time).toLocaleTimeString()}</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">{appt.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Columna Lateral: News Feed e IA */}
      <div className="space-y-6">
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <NewsFeed tenant={tenant} />
        </Suspense>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productividad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Consultas completadas: 8/12</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
