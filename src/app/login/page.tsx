import Link from "next/link";

const callbackUrl = "/auth/callback";

export default function LoginPage() {
  const googleLoginUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.18),_transparent_36%),linear-gradient(180deg,#F8FAFC_0%,#EEF2F7_100%)] px-6">
      <section className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.12)]">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">PlexusMD</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Acceso con Google</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Inicia sesión con tu cuenta clínica para entrar al tenant correcto y abrir el dashboard correspondiente.
        </p>

        <a
          href={googleLoginUrl}
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#1E293B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
        >
          Continuar con Google
        </a>

        <div className="mt-4 text-center text-sm text-slate-500">
          <Link href="/registro" className="font-medium text-teal-700 hover:text-teal-800">
            Registrar una clínica demo
          </Link>
        </div>
      </section>
    </main>
  );
}
