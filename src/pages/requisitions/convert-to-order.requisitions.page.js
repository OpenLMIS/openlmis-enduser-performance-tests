import Page from '../../components/page';
import waitForDisplayed from '../../support/action/waitForDisplayed';
import Select from '../../components/select';
import ConfirmationModal from '../../components/confirmation-modal';
import scrollToSelector from '../../support/action/scrollToSelector';

/**
 * Convert Requisitions to Order Page object represents the related view in OpenLMIS UI.
 */
class ConvertRequisitionsPage extends Page {

    constructor() {
        super({
            header: 'Convert Requisitions to Order',
            uri: 'requisitions/convertToOrder',
            navParent: 'Requisitions',
            navChild: 'Convert to Order',
        });
    }

    get convertRequisitionConfirmationModal() {
        return new ConfirmationModal({
            header: 'Are you sure you want to convert this R&R(s) to order(s)?',
            confirmButtonLabel: 'OK'
        })
    }

    confirmConvert() {
        this.convertRequisitionConfirmationModal.confirm();
    }

    /**
     * Check the checkbox option for a requisition with the given program, facility and period.
     */
    selectRequisition(program, facility, period) {
        const selector = `//td[text()="${program}"]` +
        `/following-sibling::td[text()="${facility}"]` +
        `/following-sibling::td[text()="${period}"]` +
        `/preceding-sibling::td/label/input[@type="checkbox"]`;

        scrollToSelector(selector);
        browser.$(selector).click();
    }

    /**
     * Check the checkbox option to select all requisitions.
     */
    selectAll() {
        const selector = '//th/input[@type="checkbox"]';
        scrollToSelector(selector);
        browser.$(selector).click();
    }

    openSelectDropdown(program, period) {
        Select.clickSelectInput([undefined, program, undefined, undefined, period], "Supplying depot");
    }

    addSupplyingDepot(program, period, option) {
        Select.selectOption([undefined, program, undefined, undefined, period], option, "Supplying depot");
    }

    removeSupplyingDepot(program, period) {
        Select.unselectOption([undefined, program, undefined, undefined, period], "Supplying depot");
    }

    waitForSupplyingDepotOption(option) {
        waitForDisplayed(`//span[contains(@class, "select2-container")]//li[normalize-space(text())="${option}"]`);
    }
}

export default new ConvertRequisitionsPage();
