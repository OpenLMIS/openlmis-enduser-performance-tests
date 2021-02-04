var {When} = require('cucumber');

import ConvertToOrderRequisitionsPage from '../../../../pages/requisitions/convert-to-order.requisitions.page';
import getCurrentQuarterlyPeriodName from '../../../../support/lib/getCurrentQuarterlyPeriodName';

When(
    /^I confirm the convert$/,
    () => ConvertToOrderRequisitionsPage.confirmConvert()
);

When(
    /^I navigate to Convert Requisitions to Order screen$/,
    () => ConvertToOrderRequisitionsPage.navigateToPage()
);

When(
    /^I select the requisition for "([^"]*)?" program and "([^"]*)?" facility and "([^"]*)?" period to convert to order$/,
    (program, facility, period) => ConvertToOrderRequisitionsPage.selectRequisition(program, facility, period)
);

When(
    /^I select all requisitions to convert to order$/,
    () => ConvertToOrderRequisitionsPage.selectAll()
);

When(
    /^I click on the supplying depot for "([^"]*)?" program and "([^"]*)?" period$/,
    (program, period) => ConvertToOrderRequisitionsPage.openSelectDropdown(program, period)
);

When(
    /^I unselect the supplying depot for requisition for "([^"]*)?" program and "([^"]*)?" period$/,
    (program, period) => ConvertToOrderRequisitionsPage.removeSupplyingDepot(program, period)
);

When(
    /^I select "([^"]*)?" as the supplying depot for "([^"]*)?" program and "([^"]*)?" period$/,
    (supplyingDepot, program, period) => ConvertToOrderRequisitionsPage.addSupplyingDepot(program, period,supplyingDepot)
);

When(
    /^I select "([^"]*)?" as the supplying depot for "([^"]*)?" program and current quarterly period$/,
    (supplyingDepot, program) => ConvertToOrderRequisitionsPage.addSupplyingDepot(program, getCurrentQuarterlyPeriodName(), supplyingDepot)
);
