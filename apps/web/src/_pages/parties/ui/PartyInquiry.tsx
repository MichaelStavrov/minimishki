'use client';

import {
  createContext,
  useContext,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { LeadForm } from '@/features/submit-lead';

import { partyLeadId } from '../model/catalog';

const PartyInquiryContext = createContext<{
  selection: { program: string | null };
  selectProgram: (program: string | null) => void;
} | null>(null);

export function PartyInquiry({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<{ program: string | null }>({ program: null });
  return (
    <PartyInquiryContext
      value={{ selection, selectProgram: (program) => setSelection({ program }) }}
    >
      {children}
    </PartyInquiryContext>
  );
}

type DiscussPartyLinkProps = Omit<ComponentProps<'a'>, 'href' | 'children' | 'onClick'> & {
  program?: string;
};

export function DiscussPartyLink({ program, ...props }: DiscussPartyLinkProps) {
  const { selectProgram } = usePartyInquiry();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    selectProgram(program ?? null);
  }

  return (
    <a
      {...props}
      href={`#${partyLeadId}`}
      aria-label={program ? `Обсудить программу «${program}»` : undefined}
      onClick={handleClick}
    >
      {program ? 'Обсудить программу' : 'Обсудить праздник'}
    </a>
  );
}

export function PartyLeadForm() {
  const { selection, selectProgram } = usePartyInquiry();
  return <LeadForm party={{ selection, clearProgram: () => selectProgram(null) }} />;
}

function usePartyInquiry() {
  const inquiry = useContext(PartyInquiryContext);
  if (!inquiry) throw new Error('Форма праздника должна находиться внутри PartyInquiry.');
  return inquiry;
}
