The pharmacies here have different outlets --> inpatient pharmacy, O&G pharmacy, GOPD pharmacy etc, where dispensaries are carried out. We want to be able to track where a prescription was dispensed. this is for easy reporting.

Again, drugs/items are normally transfered from bulk store to these outlets. We could also have more than one bulk store.

Supplies are received at the bulk store, from there, transfers could be made to outlets.

HERE"S the FLOW:
1. Item/product is created if it does not exist (drugs & Consummables). Item/product has a stocklevel field to manage stock balance
2. Items have different brands. Each brand also has stocklevel.
3. Items are supplied to bulk stores (there could be more than one bulk store)
4. Supply comes by brands, received according to batches. As supplies are received, brandstocklevel increases by supply qty, so does the product balance
5. Prescription is done by doctors in patients folder, (sometimes by pharmacists too), they are to prescribe these items in their generic names. This means that the prescription sheet only displays items like Paracetamol 500mg Tab, not Emzor Paracetamol.
    As items are dispensed, the stocklevel of the dispensed brand drops by the dispensed qty, consequently dropping product balance.
6. At the dispensary, the pharm sees the prescribed item. He selects a brand of the prescribed item and selects a batch of the selected brand (according to expiry dates and availability). 
7. The prices are preset from the brand creation or defined for automated mark-up from supply price, hence the pharm cannot tamper prices at dispensary. Only Bulk Store officer can do so. We can also create a price management form.
8. The dispensary Pharm can modify qty prescribed, thereby varrying the total price when billing.
9. The first action is to bill the items, he sees the bills and its status. When payment is made, the transaction can be completed by clicking dispense.
    This means that a billed item can be reserved until the patient is done with payment
10. We shall expand the dispensary more when we get there, for now, lets start from the top.
11. Everything about billing and payment is in our bills app. This app would only handle everything pharmacy. I am using pharmacies  for the app name.
I have handle most other stuff about the app, simply working on the pharm app. we shall handling billing of prescribed item from bills app (already setup)

I HAVE MY FRONTEND STARTED ALREADY (REACT JS) WE SHALL ALSO REFACTOR IT.


TRANSFER LOGIC:
Lets handle the transfer logic

The idea is this:

1. transfer request are send/written (a form filled) by the requesting unit/outlet.
2. There's no approval level, a simple decline or honor of the request.
3. For decline, a reason must be stated, to honor the request simply means doing the transfer as requested, qty transfered can be varried depending on available qty. When this is done, the requesting unit gets an increase in stockbalance while the transferring store gets decrease.
Transfers can only go from store to outlet, not the reverse. (We may need a return to store action for some items though, especially outdated ones or wrong transfer.)
4. It would be nice that the requesting unit can see the availability status of the item in the unit he's making the transfer request.
5. The requesting unit/outlet should default to the users' unit, same as the transferring unit during transfer.
6. transfer cannot go beyond available stock.

DISPENSARY PROCESS:

STEPS:
1. Pharmacist searches out a patient (already captured)
2. If there are prescriptions for this patient, they are listed with their details. Here all prescriptions (pending, billed, and partly_dispensed etc) are listed .
3. On same page, the pharm can do two things: --> Bill and Dispense
4. Pharm bills the items that the patient wants at the time, this implies selecting a brand of the prescribed item from a dropdown option, another dropdown to select batch (of the selected brand). This ofcos ddisplays the price of the selected item, gives the line total = price * qty
5. Same process applies to all prescribed item as needed by the patient.
6. The Pharm clicks bill. This triggers the billing on billing app(already handled)
7. When patient goes to paypoint to pay, the next possible action on this page is to click dispense, only then are qty reduced at the store.
8. Free free to suggest design improvements.