import { defineSupportCode } from 'cucumber';

import UserProfilePage from '../../../pages/referencedata/user.profile.page';

defineSupportCode(({ Then }) => {

    Then(
        /^I should be brought to the user profile page$/,
        () => UserProfilePage.waitForIsVisible()
    );

});
