import { defineSupportCode } from 'cucumber';

import ViewRequisitionPage from '../../../../pages/requisitions/view.requisition.page';

defineSupportCode(({ When }) => {

    When(
        /^I open requisition history modal/,
        () => ViewRequisitionPage.clickRequisitionHistoryLink()
    );

});