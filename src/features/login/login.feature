Feature: Login
  As an Administrator
  I want to be able to Login and Logout
  so that I may access the home page

  Scenario: User logs in and is brought to the home page
    Given I navigate to the login page
    And I enter the username "mjones"
    And I enter the password "password"
    When I submit the form
    Then I should be brought to the home page