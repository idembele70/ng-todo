import { Page } from "@playwright/test";

export default class HeaderComponent {
  
  constructor(private readonly page: Page) {
  }

  readonly removeAllButton = this.page.getByRole('button', { name: 'Vider' });
};
