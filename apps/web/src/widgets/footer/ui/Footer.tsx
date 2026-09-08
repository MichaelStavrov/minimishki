import Link from 'next/link';
import type { SiteSettingsDto } from '@minimishki/shared';

import { getLines, getPhoneHref, getSocialLinks } from '@/entities/site-settings';

import { publicNavigation } from '@/shared/config/navigation';
import { BrandMark } from '@/shared/ui';

export function Footer({ settings }: { settings: SiteSettingsDto | null }) {
  const addressLines = getLines(settings?.address ?? null);
  const workingHours = getLines(settings?.workingHours ?? null);
  const socialLinks = settings ? getSocialLinks(settings) : [];
  const phoneHref = getPhoneHref(settings?.phone ?? null);

  return (
    <footer className="mt-auto border-t border-cream-200 bg-teal-700 text-cream-50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.3fr_0.7fr_1fr] lg:py-16">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full"
            aria-label="Минимишки — на главную"
          >
            <BrandMark className="w-44" />
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-6 text-cream-100">
            Детский центр, где занятия, праздники и свободная игра становятся маленькими
            приключениями.
          </p>

          {settings?.phone && phoneHref ? (
            <a
              href={phoneHref}
              className="mt-6 inline-flex rounded-full bg-cream-50 px-5 py-3 text-sm font-extrabold text-teal-700 transition-transform duration-200 outline-none hover:-translate-y-0.5 hover:shadow-soft focus-visible:ring-[3px] focus-visible:ring-honey-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-700"
            >
              {settings.phone}
            </a>
          ) : null}
        </div>

        <div>
          <h2 className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">Разделы</h2>
          <nav aria-label="Навигация в подвале" className="mt-4 flex flex-col items-start gap-2">
            {publicNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg text-sm font-bold text-cream-100 transition-colors hover:text-honey-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <address className="not-italic">
          <h2 className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">
            Ждём вас
          </h2>

          {addressLines.length > 0 ? (
            <p className="mt-4 text-sm leading-6 text-cream-100">
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          ) : null}

          {workingHours.length > 0 ? (
            <p className="mt-4 text-sm leading-6 text-cream-100">
              {workingHours.map((hours) => (
                <span key={hours} className="block">
                  {hours}
                </span>
              ))}
            </p>
          ) : null}

          {socialLinks.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((socialLink) => (
                <a
                  key={socialLink.href}
                  href={socialLink.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full text-sm font-bold text-cream-100 underline decoration-honey-400 decoration-2 underline-offset-4 transition-colors outline-none hover:text-honey-400 focus-visible:ring-[3px] focus-visible:ring-honey-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-700"
                >
                  {socialLink.label}
                </a>
              ))}
            </div>
          ) : null}
        </address>
      </div>

      <div className="border-t border-cream-50/15">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-5 text-xs font-semibold text-cream-100 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Детский центр «Минимишки»</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {settings?.legalName || settings?.inn ? (
              <p>
                {[settings.legalName, settings.inn && `ИНН ${settings.inn}`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ) : null}
            {settings?.privacyPolicyUrl ? (
              <a
                className="underline decoration-honey-400 decoration-2 underline-offset-4"
                href={settings.privacyPolicyUrl}
                target="_blank"
                rel="noreferrer"
              >
                Политика обработки данных
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
