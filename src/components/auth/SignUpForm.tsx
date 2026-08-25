"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

function getDestination(nextPath: string | null) {
  return nextPath?.startsWith("/") && !nextPath.startsWith("//")
    ? nextPath
    : "/";
}

export default function SignUpForm() {
  const { isReady, signUp, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const destination = useMemo(
    () => getDestination(searchParams.get("next")),
    [searchParams],
  );
  const signInPath = searchParams.get("next")
    ? `/signin?next=${encodeURIComponent(destination)}`
    : "/signin";

  useEffect(() => {
    if (isReady && user) {
      router.replace(destination);
    }
  }, [destination, isReady, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Para continuar, aceite os termos de uso e a política de privacidade.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp({ firstName, lastName, email, password });
      if (!result.ok) {
        setError(result.message);
        return;
      }

      router.replace(destination);
    } catch {
      setError("Não foi possível criar sua conta agora. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar lg:w-1/2">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          href={signInPath}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Voltar para entrar
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-brand-500 uppercase">
            OceanQuiet
          </p>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Crie seu espaço de calma
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Leva só um instante para começar a organizar sua semana.
          </p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>
                Nome <span className="text-error-500">*</span>
              </Label>
              <Input
                id="first-name"
                name="firstName"
                type="text"
                placeholder="Seu nome"
                onChange={(event) => setFirstName(event.target.value)}
                error={Boolean(error)}
              />
            </div>
            <div>
              <Label>
                Sobrenome <span className="text-error-500">*</span>
              </Label>
              <Input
                id="last-name"
                name="lastName"
                type="text"
                placeholder="Seu sobrenome"
                onChange={(event) => setLastName(event.target.value)}
                error={Boolean(error)}
              />
            </div>
          </div>

          <div>
            <Label>
              E-mail <span className="text-error-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="voce@exemplo.com"
              onChange={(event) => setEmail(event.target.value)}
              error={Boolean(error)}
            />
          </div>

          <div>
            <Label>
              Senha <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="No mínimo 8 caracteres"
                onChange={(event) => setPassword(event.target.value)}
                error={Boolean(error)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              className="mt-0.5"
              checked={acceptedTerms}
              onChange={setAcceptedTerms}
            />
            <p className="text-sm leading-5 text-gray-500 dark:text-gray-400">
              Ao criar sua conta, você concorda com os termos de uso e a política de privacidade.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isReady || isSubmitting}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Criando conta…" : "Criar conta"}
          </button>
        </form>

        <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
          Para este protótipo, os dados de acesso são salvos apenas neste navegador.
        </p>

        <div className="mt-5">
          <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
            Já tem uma conta?{" "}
            <Link
              href={signInPath}
              className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
