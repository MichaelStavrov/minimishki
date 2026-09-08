import type { SiteSettingsDto } from '@minimishki/shared';

import { getLines, getPhoneHref, getSocialLinks } from '@/entities/site-settings';

import { contacts } from '@/shared/config/contacts';
import { Button, Card, CardContent, CardHeader } from '@/shared/ui';

export function ContactsPage({ settings }: { settings: SiteSettingsDto | null }) {
  const addressLines = getLines(settings?.address ?? null);
  const workingHours = getLines(settings?.workingHours ?? null);
  const socialLinks = settings ? getSocialLinks(settings) : [];
  const phoneHref = getPhoneHref(settings?.phone ?? null);

  return (
    <main>
      <section className="relative overflow-hidden px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 size-72 rounded-full bg-honey-100"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 -left-12 size-56 rounded-[42%] bg-coral-100"
        />

        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">Контакты</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] text-teal-700 sm:text-6xl">
            Давайте познакомимся лично
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-teal-700 sm:text-xl">
            Позвоните нам, напишите в социальных сетях или постройте маршрут — будем рады видеть вас
            в «Минимишках».
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {phoneHref ? (
              <Button asChild size="lg">
                <a href={phoneHref}>Позвонить в центр</a>
              </Button>
            ) : null}

            <Button asChild variant="outline" size="lg">
              <a
                href={contacts.mapUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Открыть карточку центра в Яндекс Картах"
              >
                Построить маршрут
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          <Card className="border-0 bg-teal-700 text-cream-50 shadow-lifted">
            <CardHeader>
              <p className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">Адрес</p>
              <h2 className="text-2xl font-black tracking-tight">Ждём вас в Пушкино</h2>
            </CardHeader>

            <CardContent>
              <address className="text-lg leading-8 text-cream-100 not-italic">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>

              <Button asChild variant="secondary" className="mt-7">
                <a
                  href={contacts.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Открыть карточку центра в Яндекс Картах"
                >
                  Открыть Яндекс Карты
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-honey-100 shadow-soft">
            <CardHeader>
              <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
                Режим работы
              </p>
              <h2 className="text-2xl font-black tracking-tight text-teal-700">Можно без спешки</h2>
            </CardHeader>

            <CardContent>
              <div className="text-lg leading-8 text-teal-700">
                {workingHours.map((hours) => (
                  <p key={hours}>{hours}</p>
                ))}
              </div>

              {settings?.phone && phoneHref ? (
                <a
                  href={phoneHref}
                  className="mt-7 inline-flex text-xl font-black tracking-tight text-teal-700 underline decoration-coral-400 decoration-2 underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-teal-600/45"
                >
                  {settings.phone}
                </a>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-0 bg-cream-100 shadow-soft">
            <CardHeader>
              <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
                На связи
              </p>
              <h2 className="text-2xl font-black tracking-tight text-teal-700">
                Напишите в удобном мессенджере
              </h2>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((socialLink) => (
                  <Button key={socialLink.href} asChild variant="outline">
                    <a href={socialLink.href} target="_blank" rel="noreferrer">
                      {socialLink.label}
                    </a>
                  </Button>
                ))}
              </div>

              <p className="mt-7 text-base leading-7 text-teal-700">
                Отвечаем на вопросы о занятиях, праздниках и первом визите в центр.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
