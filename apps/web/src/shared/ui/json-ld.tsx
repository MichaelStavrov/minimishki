type JsonLdProps = {
  data: Record<string, unknown>;
};

/** Безопасно встраивает структурированные данные Schema.org в серверный HTML. */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
