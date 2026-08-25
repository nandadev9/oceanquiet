"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

function getDestination(nextPath: string | null) {
  return nextPath?.startsWith("/") && !nextPath.startsWith("//")
    ? nextPath
    : "/";
}

export default function SignInForm() {
  const { isReady, signIn, user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const destination = useMemo(
    () => getDestination(searchParams.get("next")),
    [searchParams],
  );
  const signUpPath = searchParams.get("next")
    ? `/signup?next=${encodeURIComponent(destination)}`
    : "/signup";

  useEffect(() => {
    if (isReady && user) {
      router.replace(destination);
    }
  }, [destination, isReady, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKey(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);
      if (!result.ok) {
        setErrorKey(`auth.error.${result.code}` as TranslationKey);
        return;
      }

      router.replace(destination);
    } catch {
      setErrorKey("auth.error.genericSignIn");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 w-full lg:w-1/2">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          {t("auth.back")}
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-brand-500 uppercase">
            OceanQuiet
          </p>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            {t("auth.signIn.title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("auth.signIn.description")}
          </p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>
              {t("auth.email")} <span className="text-error-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              onChange={(event) => setEmail(event.target.value)}
              error={Boolean(errorKey)}
            />
          </div>

          <div>
            <Label>
              {t("auth.password")} <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.passwordPlaceholder")}
                onChange={(event) => setPassword(event.target.value)}
                error={Boolean(errorKey)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
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

          {errorKey && (
            <p
              role="alert"
              className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300"
            >
              {t(errorKey)}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={!isReady || isSubmitting}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? t("auth.signIn.submitting") : t("auth.signIn.submit")}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
          {t("auth.signIn.localSession")}
        </p>

        <div className="mt-5">
          <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
            {t("auth.signIn.noAccount")} {" "}
            <Link
              href={signUpPath}
              className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              {t("auth.createAccount")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
