import Page from '../../components/page';
import waitForVisible from '../../support/action/waitForVisible';
import Button from '../../components/button';
import chooseSelectOption from '../../support/action/chooseSelectOption';

/**
 * View Requisitions Page object represents the related view in OpenLMIS UI.
 */
class ViewRequisitionsPage extends Page {

    constructor() {
        super({
            header: 'View Requisitions',
            uri: 'requisitions/view',
            navParent: 'Requisitions',
            navChild: 'View',
        });
    }

    /**
     * Get this search button.
     */
    get searchButton() {
        return new Button('Search');
    }

    /**
     * Click to search.
     */
    clickSearch() {
        this.searchButton.click();
    }

    /**
     * Select the given facility and click on "Search" button.
     *
     * @param {String} facility  Facility name.
     */
    searchForFacility(facility) {
        chooseSelectOption('Facility', facility);
        this.searchButton.click();
    }

    /**
     * Click on 'View requisition' button for the given requisition.
     *
     * @param {String} program  Program name.
     * @param {String} period  Period name.
     */
    viewRequisition(program, period) {
        browser.execute((program, period) => {
            $('table tr')
                .filter((index, element) => {
                    const that = $(element),
                        programCell = that.find('td:nth-child(1)').text(),
                        periodCell = that.find('td:nth-child(3)').text();

                    return program === programCell && period === periodCell;
                })
                .find('td:nth-child(10) button:nth-child(1)')
                .click();
        }, program, period);
    }

    /**
     * Wait for the table to be visible.
     */
    waitForTable() {
        waitForVisible('//table/tbody/tr/td');
    }
}

export default new ViewRequisitionsPage();
