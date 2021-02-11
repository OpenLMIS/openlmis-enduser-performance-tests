Feature: Converting requisitions to orders

    Scenario: Superuser should be able to convert one requisition to order
        Given I navigate to the login page
        And I have logged with username "superuser" and password "password"

        When I navigate to Convert Requisitions to Order screen
        Then I should be brought to Convert Requisitions to Order screen

        When I click on the "Filter" button without waiting for loading modal
        And I select "Lilongwe DHO Pharmacy" from the "Facility" list
        And I wait "1" seconds for UI adjustment
        And I click on the "Search" button
        And I select "CMST - Central" as the supplying depot for "Essential Meds" program and "Aug2017" period
        And I select the requisition for "Essential Meds" program and "LL1503 - Lilongwe DHO Pharmacy" facility and "Aug2017" period to convert to order
        And I click on the "Convert to Order" button
        And I wait "2" seconds for UI adjustment
        And I confirm the convert
        Then I should see a successful notification saying "The requisition(s) have been successfully converted to an order(s)"