import { expect, Page } from "@playwright/test";
import { i18n } from "../../utils/i18n";

export default class FooterComponent {
  constructor(private readonly page: Page) {
  }

  private readonly footer = this.page.locator('footer');
  readonly previousButton = this.footer.getByRole('button', { name: i18n.footer.button.previous.label });
  readonly nextButton = this.footer.getByRole('button', { name: i18n.footer.button.next.label });
  readonly pageInfo = this.footer.locator('span.muted');

  async assertPreviousButtonIsEnabled() {
    await expect(this.previousButton).toBeEnabled();
    await expect(this.previousButton).toHaveAttribute('title', i18n.footer.button.previous.title.enabled);
  }

  async assertPreviousButtonIsDisabled() {
    await expect(this.previousButton).toBeDisabled();
    await expect(this.previousButton).toHaveAttribute('title', i18n.footer.button.previous.title.disabled);
  }

  async assertNextButtonIsEnabled() {
    await expect(this.nextButton).toBeEnabled();
    await expect(this.nextButton).toHaveAttribute('title', i18n.footer.button.next.title.enabled);
  }

  async assertNextButtonIsDisabled() {
    await expect(this.nextButton).toBeDisabled();
    await expect(this.nextButton).toHaveAttribute('title', i18n.footer.button.next.title.disabled);
  }

  async assertPageInfoText(currentPage: number, totalItems: number) {
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    await expect(this.pageInfo).toHaveText(`Page ${currentPage} / ${totalPages}`);
  }
};
