import { defineSupportCode } from 'cucumber';

import waitForVisible from '../../support/action/waitForVisible';
import fillInput from '../../support/action/fillInput';
import clickRadioInput from '../../support/action/clickRadioInput';
import chooseSelectOption from '../../support/action/chooseSelectOption';
import offlineMode from '../../support/action/offlineMode';
import Button from '../../components/button';
import AlertModal from '../../components/alert-modal';

defineSupportCode(({ When }) => {

    When(
        /^I enable offline mode$/,
        () => offlineMode(true)
    );

    When(
        /^I disable offline mode$/,
        () => offlineMode(false)
    );

    When(
        /^I enter "([^"]*)?" as "([^"]*)?"$/,
        (value, label) => fillInput(label, value)
    );

    When(
        /^I select "([^"]*)?" as "([^"]*)?"$/,
        (option, label) => clickRadioInput(label, option)
    );

    When(
        /^I select "([^"]*)?" from the "([^"]*)?" list$/,
        (option, label) => chooseSelectOption(label, option)
    );

    When(
        /^I click on the "([^"]*)?" button$/,
        name => new Button(name).click()
    );

    When(
        /^I close the error message$/,
        () => new AlertModal().close()
    );

    When(
        /^I refresh page$/,
        () => {
            browser.refresh();
            waitForVisible('//h2');
        }
    );
});
