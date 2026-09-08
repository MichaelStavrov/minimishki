import { createElement } from 'react';

import { getPublicSiteSettings } from '@/entities/site-settings/index.server';

import { ContactsPage } from './ui/ContactsPage';

export default async function ContactsPageRoute() {
  const settings = await loadSiteSettings();
  return createElement(ContactsPage, { settings });
}

async function loadSiteSettings() {
  try {
    return await getPublicSiteSettings();
  } catch {
    return null;
  }
}
