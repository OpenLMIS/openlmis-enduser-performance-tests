import { defineSupportCode } from 'cucumber';

import ViewRequisitionPage from '../../../../pages/requisitions/view.requisition.page';

defineSupportCode(({ When }) => {

    When(
        /^I confirm the authorize/,
        () => {
            ViewRequisitionPage.confirmAuthorize();
        }
    );
});
