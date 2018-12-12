import { defineSupportCode } from 'cucumber';

import approveRequisitionsPage from '../../../../pages/requisitions/approve.requisitions.page';

defineSupportCode(({ Then }) => {

    Then(
        /^I should be redirected to approve requisitions screen$/,
        () => approveRequisitionsPage.waitForIsVisible()
    );

    Then(
        /^I should be able to see the Total requisition cost updated to "([^"]*)?"$/,
        (cost) => expect(approveRequisitionsPage.getTotalCost()).to.equal(cost)
    );
});