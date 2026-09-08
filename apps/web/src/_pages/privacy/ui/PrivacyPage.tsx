import type { ReactNode } from 'react';
import { POLICY_VERSION } from '@minimishki/shared';

import { contacts } from '@/shared/config/contacts';

const operatorName = 'Индивидуальный предприниматель Ставров Михаил Николаевич';

export function PrivacyPage() {
  return (
    <main className="px-5 py-14 sm:px-8 sm:py-20">
      <article className="mx-auto max-w-4xl">
        <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
          Юридическая информация
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-teal-700 sm:text-6xl">
          Политика обработки персональных данных
        </h1>
        <p className="mt-6 text-lg leading-8 text-teal-700">
          Настоящая политика определяет порядок обработки и защиты персональных данных, получаемых
          детским центром «Минимишки» через сайт.
        </p>
        <p className="mt-3 text-sm font-bold text-teal-600">Версия {POLICY_VERSION}</p>

        <div className="mt-10 space-y-10 rounded-3xl bg-cream-100 p-6 text-base leading-7 text-teal-700 shadow-soft sm:p-10">
          <PolicySection title="1. Общие положения">
            <p>
              {operatorName} (далее — «Оператор») обрабатывает персональные данные в соответствии с
              Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и иными применимыми
              нормами законодательства Российской Федерации.
            </p>
            <p>
              Политика применяется к данным, которые посетитель сайта передаёт Оператору через формы
              заявки и отзыва. Передача данных через форму означает согласие с настоящей Политикой в
              объёме и для целей, указанных в ней.
            </p>
          </PolicySection>

          <PolicySection title="2. Сведения об Операторе">
            <dl className="grid gap-3 sm:grid-cols-[12rem_1fr]">
              <Detail label="Оператор">{operatorName}</Detail>
              <Detail label="ИНН">503815758966</Detail>
              <Detail label="Адрес">
                {contacts.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </Detail>
              <Detail label="Email">
                <a
                  className="font-bold underline decoration-coral-400 decoration-2 underline-offset-4"
                  href="mailto:mimimishki-mo@yandex.ru"
                >
                  mimimishki-mo@yandex.ru
                </a>
              </Detail>
            </dl>
          </PolicySection>

          <PolicySection title="3. Какие данные и для чего обрабатываются">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-teal-200">
                    <th className="px-3 py-3 font-black">Источник</th>
                    <th className="px-3 py-3 font-black">Данные</th>
                    <th className="px-3 py-3 font-black">Цель</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-teal-100 align-top">
                    <td className="px-3 py-3 font-bold">Форма заявки</td>
                    <td className="px-3 py-3">
                      Имя, номер телефона, имя и возраст ребёнка, интересующее направление,
                      комментарий.
                    </td>
                    <td className="px-3 py-3">
                      Связаться с посетителем, подобрать занятие или формат услуги, обработать
                      обращение.
                    </td>
                  </tr>
                  <tr className="border-b border-teal-100 align-top">
                    <td className="px-3 py-3 font-bold">Форма отзыва</td>
                    <td className="px-3 py-3">Имя, email, оценка, текст отзыва.</td>
                    <td className="px-3 py-3">
                      Проверить отзыв, связаться при необходимости и опубликовать его после
                      модерации.
                    </td>
                  </tr>
                  <tr className="align-top">
                    <td className="px-3 py-3 font-bold">Технические сведения</td>
                    <td className="px-3 py-3">
                      Псевдонимизированный IP-отпечаток при отправке отзыва.
                    </td>
                    <td className="px-3 py-3">
                      Защитить форму от спама и ограничить число повторных отправок.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Оператор не запрашивает через сайт специальные категории персональных данных. Сведения
              о ребёнке передаёт его родитель или иной законный представитель только в объёме,
              необходимом для обработки заявки.
            </p>
          </PolicySection>

          <PolicySection title="4. Правовые основания и действия с данными">
            <p>
              Основание обработки — согласие субъекта персональных данных либо его законного
              представителя, выраженное отдельной отметкой в форме. Оператор может собирать,
              записывать, систематизировать, хранить, уточнять, использовать, блокировать и удалять
              данные исключительно для целей из раздела 3.
            </p>
            <p>
              Отзывы публикуются только после проверки. Email автора отзыва и технические сведения
              публично не размещаются. Передача данных третьим лицам не производится, кроме случаев,
              когда это прямо требуется законодательством Российской Федерации.
            </p>
          </PolicySection>

          <PolicySection title="5. Хранение и защита данных">
            <p>
              При сборе персональных данных граждан Российской Федерации Оператор обеспечивает их
              запись, систематизацию, накопление, хранение, уточнение и извлечение с использованием
              баз данных, находящихся на территории Российской Федерации. Оператор принимает
              необходимые правовые, организационные и технические меры для защиты данных от
              неправомерного или случайного доступа, уничтожения, изменения, блокирования,
              копирования, предоставления и распространения.
            </p>
            <p>
              Данные хранятся не дольше, чем это требуется для целей обработки, если более
              длительный срок не установлен законодательством. После достижения целей обработки,
              истечения срока хранения или отзыва согласия данные уничтожаются либо обезличиваются,
              если у Оператора отсутствует законное основание продолжать их обработку.
            </p>
          </PolicySection>

          <PolicySection title="6. Права субъекта персональных данных">
            <p>
              Субъект персональных данных или его законный представитель вправе запросить сведения
              об обработке данных, потребовать уточнения, блокирования или уничтожения неточных,
              устаревших либо избыточных данных, а также отозвать согласие на их обработку.
            </p>
            <p>
              Для обращения напишите Оператору на{' '}
              <a
                className="font-bold underline decoration-coral-400 decoration-2 underline-offset-4"
                href="mailto:mimimishki-mo@yandex.ru"
              >
                mimimishki-mo@yandex.ru
              </a>
              . Укажите в обращении имя, контакт для ответа и суть запроса. Оператор рассмотрит
              обращение в срок, предусмотренный законодательством Российской Федерации.
            </p>
          </PolicySection>

          <PolicySection title="7. Cookie и статистика посещений">
            <p>
              Сайт использует технические cookie для корректной работы и cookie Яндекс.Метрики для
              статистики посещений. Метрика получает сведения об активности на сайте, cookie и
              устройстве посетителя; Оператор использует их для оценки посещаемости и улучшения
              сайта. Данные передаются ООО «Яндекс» как лицу, действующему по поручению Оператора.
            </p>
            <p>
              Уведомление о cookie показывается при первом посещении и может быть закрыто кнопкой
              «Понятно». Оно не отключает технические cookie и статистику. Оператор вправе обновлять
              Политику при изменении порядка обработки данных или требований законодательства.
              Актуальная версия всегда размещается на этой странице.
            </p>
          </PolicySection>
        </div>
      </article>
    </main>
  );
}

function PolicySection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section>
      <h2 className="text-2xl font-black tracking-tight text-teal-700">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Detail({ children, label }: { children: ReactNode; label: string }) {
  return (
    <>
      <dt className="font-black">{label}</dt>
      <dd>{children}</dd>
    </>
  );
}
