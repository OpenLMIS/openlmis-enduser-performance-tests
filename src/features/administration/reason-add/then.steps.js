import { defineSupportCode } from 'cucumber';

import '../../login/then.steps.js';
import '../../common/then.steps.js';

import ReasonAddPage from '../../../pages/administration/reason.add.page';

defineSupportCode(({ Then }) => {

    Then(
        /^I should be brought to the reason creation page$/,
        () => ReasonAddPage.waitForIsVisible()
    );

    Then(
        /^I should see assignment for "([^"]*)?" program and "([^"]*)?" facility type$/,
        (program, facilityType) => ReasonAddPage.waitForAssignment(program, facilityType)
    );

});
