import { Page } from "@playwright/test";
import { i18n } from "../../utils/i18n";

export default class HeaderComponent {
  
  constructor(private readonly page: Page) {
  }

  readonly removeAllButton = this.page.getByRole('button', { name: i18n.header.clear.all.label });
};
