Feature: Converting requisitions to orders

    Scenario: Superuser should be able to convert one requisition to order
        Given I navigate to the login page
        And I have logged with username "superuser" and password "password"

        When I navigate to Convert Requisitions to Order screen
        Then I should be brought to Convert Requisitions to Order screen

        When I go to the "2" page
        And I select "CMST - Central" as the supplying depot for "Essential Meds" program and "Aug2017" period
        And I select the requisition for "Essential Meds" program and "LL1503 - Lilongwe DHO Pharmacy" facility and "Aug2017" period to convert to order
        And I click on the "Convert to Order" button
        And I confirm the convert
        Then I should see a successful notification saying "The requisition(s) have been successfully converted to an order(s)"