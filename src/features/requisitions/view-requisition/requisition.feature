Feature: Requisition

  Scenario: User should be able to initiate requisition for home facility
    Given I navigate to the login page
    And I have logged with username "mjones" and password "password"

    When I go to initiate requisition screen
    Then I should be brought to the initiate requisition screen

    When I select "Essential Meds" from the "Program" list
    And I wait "300" seconds for UI adjustment
    And I click on the "Search" button
    Then I should see periods table

    When I click on the "Proceed" button
    Then I should be redirected to requisition view screen

  Scenario: User should be able to sync requisition with the server
    When I click on the "Sync with Server" button
    Then I should see a successful notification saying "Requisition has been synchronized!"

  Scenario: User should be able to submit requisition for home facility
    When I go to the "2" page
    And I set "Open bal" as empty for "Amoxycillin w/ Clavulanic Acid, 500mg/125mg" product
    And I set "Open bal" as empty for "Aspirin 300mg, tablets" product
    And I go to the "1" page
    And I set "Open bal" as empty for "Albendazole 200mg" product
    And I set "Open bal" as empty for "Aminophylline 100mg" product
    And I set "Open bal" as empty for "Amitriptyline 25mg" product
    And I set "Open bal" as empty for "Amoxycillin 250mg, Tablets" product

    And I set "Close bal" as "90" for "Acyclovir 200mg" product
    And I set "Qty used" as "10" for "Acyclovir 200mg" product
    And I set "SOD" as "10" for "Acyclovir 200mg" product
    And I set "Qty rec" as "0" for "Acyclovir 200mg" product
    And I set "Open bal" as "100" for "Acyclovir 200mg" product
    And I set "Qty req" as "10" for "Acyclovir 200mg" product
    And I set "Qty req exp" as "need more" for "Acyclovir 200mg" product

    And I set "Close bal" as "90" for "Albendazole 400mg" product
    And I set "Qty used" as "10" for "Albendazole 400mg" product
    And I set "SOD" as "10" for "Albendazole 400mg" product
    And I set "Qty rec" as "0" for "Albendazole 400mg" product
    And I set "Open bal" as "100" for "Albendazole 400mg" product
    And I set "Qty req" as "10" for "Albendazole 400mg" product
    And I set "Qty req exp" as "need more" for "Albendazole 400mg" product

    And I set "Close bal" as "90" for "Allopurinol 100mg" product
    And I set "Qty used" as "10" for "Allopurinol 100mg" product
    And I set "SOD" as "10" for "Allopurinol 100mg" product
    And I set "Qty rec" as "0" for "Allopurinol 100mg" product
    And I set "Open bal" as "100" for "Allopurinol 100mg" product
    And I set "Qty req" as "10" for "Allopurinol 100mg" product
    And I set "Qty req exp" as "need more" for "Allopurinol 100mg" product

    And I skip remaining products
    And I click on the "Submit" button
    And I confirm the submit
    Then I should see a successful notification saying "Requisition has been submitted!"
    And I should see periods table

  Scenario: User should be able to authorize the requisition
    When I select "Essential Meds" from the "Program" list
    And I click on the "Search" button
    Then I should see periods table

    When I click on the "Proceed" button
    Then I should be redirected to requisition view screen

    When I set "Qty req" as "20" for "Acyclovir 200mg" product
    And I set "Qty req exp" as "need more" for "Acyclovir 200mg" product

    And I set "Qty req" as "20" for "Albendazole 400mg" product
    And I set "Qty req exp" as "need more" for "Albendazole 400mg" product

    And I set "Qty req" as "10" for "Allopurinol 100mg" product
    And I set "Qty req exp" as "need more" for "Allopurinol 100mg" product

    And I click on the "Authorize" button
    And I confirm the authorize
    Then I should see a successful notification saying "Requisition has been authorized!"
    And I should see periods table
    And I log out

  Scenario: Superuser should be able to approve requisition for home facility
    Given I have logged with username "superuser" and password "password"

    When I wait "10" seconds for UI adjustment
    And I navigate to approve requisitions screen
    Then I should be redirected to approve requisitions screen
    And I should see a requisition for "Essential Meds" program, "Aug2017" period inside the table

    When I click on the "Filter" button without waiting for loading modal
    And I select "Essential Meds" from the "Program" list
    And I wait "1" seconds for UI adjustment
    And I click on the "Search" button
    Then I should see a requisition for "Essential Meds" program, "Aug2017" period inside the table

    When I select requisition for "Essential Meds" program and "Aug2017" period for approve requisitions
    Then I should be brought to the product grid screen

    And I set "Qty approved" as "10" for "Acyclovir 200mg" product
    And I set "Qty approved" as "10" for "Albendazole 400mg" product
    And I set "Qty approved" as "10" for "Allopurinol 100mg" product

    When I click on the "Approve" button
    And I confirm the approval
    Then I should see a successful notification saying "Requisition has been approved!"
    And I should be redirected to approve requisitions screen