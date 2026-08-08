# Reading AppContext.tsx file for refactoring

## 1. File Responsibility

> This AppContext is the brain of entire frontend application, because it comsumes all interfaces, dummy items data by importing and creates an Context and Does All CRUD operations of entire application. Means this single Context file contains all logics of every module and states + it holds all UI related, pages and components related states and setterMethods inside it and wraps `children` props with it. Plus it also exposes these all states and setters via useApp() hook which internally using useContext();

## 2. Types of State

```
UI State
-----------
tableNumber -> this is used in both UI and logic for backend order and waiter request
setTableNumber
isCartOpen with setter
isTableSwitcherOpen and setter
isMobileSidebarOpen and setter

activeCategory and setter -> confused because it is used in UI but yeah nope it will not gonna use for backend logic

and cart related states and methods -> here in backend we didn't managing cart so yeah this is also for UI

activeRole and setter -> don't know why is this

Business State
----------------
allOrders
allWaiterRequests
submitDraftOrder
updateOrderToKitchen
updateOrderStatus
requestBillForTable
payBillForTable
assignWaiterToCall
resolveWaiterToCall
menuItems
addMenuItem
updateMenuItem
deleteMenuItem
staffUsers
addStaffUsers
updateStaffUsers
deleteStaffUsers
restaurantTables
addTable
updateTable
deleteTable

-- confused is it business related or not
waiterRequest
triggerCallWaiter
cancelWaiterRequest
sendOrderToKitchen
--

restaurant
------------
restaurantGstProfile
updateRestaurantGstProfile


Authentication
---------------
activeRole and setter

Temporary
-----------
invoiceSequence -> you already have this file kindly tell me why this state and setter method?
```

## 3. Context Values

what i mentioned above section 2 all are exposed in context as values

## 4. Functions

setTableNumber
addToCart
removeFromCart
updateCartItemQuantity
clearCart
setIsCartOpen
setIsTableSwitcherOpen
setIsMobileSidebarOpen
setActiveCategory
addMenuItem
updateMenuItem
deleteMenuItem
addStaffUser
updateStaffUser
deleteStaffUser
triggerCallWaiter
cancelWaiterRequest
setActiveRole
submitDraftOrder
updateOrderItems
sendOrderToKitchen
updateOrderStatus
requestBillForTable
payBillForOrder
assignWaiterToCall
resolveWaiterCall
updateRestaurantGstProfile

and generateMockOrders

## 5. localStorage

```
allWaiterRequest -> Stored in localStorage
allOrders -> Stored in localStorage
restaurantTables -> Stored in localStorage
staffUsers -> Stored in localStorage
menuItems -> Stored in localStorage
invoiceSequence -> Stored in localStorage
restaurantGstProfile -> Stored in localStorage
```

## 6. useEffects

```
1st it was used for Parse tableNo and admin role routing from URL on load and popstate using URLSearchParams
2nd used for sync customer specific waiterRequest based on that table and status in allWaiterRequests
3rd used to store allWaiterRequests to localStorage
4th used to store allOrders to localStorage
5th used to store restaurantTables to localStorage
6th used to store staffUsers to localStorage
7th used to store menuItems to localStorage
8th used to store invoiceSequence to localStorage
9th used to store restaurantGstProfile to localStorage

```

## 7. Business Modules

Authentication (for now it's weak)
Cart
Orders
Billing (payment not including + all CRUD are at frontend level only)
Customers

- Although this AppContext is lack payment, otp and customer login..

Waiter Request
Kitchen

## 8. Biggest Problems

- Everything stored together.
- Large Context
- Some unrelated functions
- Business logic mixed together.
- Single Context knows too much.
- Lack of Reusability, maintainability, and not readable
- Didn't used Reducer for complex and larger datasets
- Non future proof

## Final Five Questions/Answer

1. What is this file responsible for?

   > This file is responsible for global state management using contextApi, and complex business logics inside context api + UI related states too.

2. What responsibilities should not be here?

   > I think business logic should not be here because this state management is for actual data holding with setter method so yeah this already or will have setter method we can use business logic here too, well see it all depends but i think better to use another file for logic and final storage we call this state management setter method. 2nd This is cluttered, each business module or preferences have it's own context management file, which fixes readability, maintainability and overwhelmed issue. 3rd This might not contains unnecessary states which can be declared as local state. 4th this cannot just use contextapi for larger dataset because for those we have useReducer which can easily paired with context api. 5th for more complex this app is not bound to ContextAPI instead flexible to use zustand or other best solutions.

3. Which business modules does it touch?

   > All business module it has touched except customer registeration.

4. Which files does it depend on?

   > MenuData.ts, types.ts which are the files holding interfaces and mock datas. or we have call interfaces in dart and laravel this files holds models + it also dependent on localStorage

5. How would I redesign it?
   > I would first divide each module states, contextAPi and logics into separate context files, or i can extrude unnecessary states which are dependent on single or 2 files because this states can be used as local state rather global state. I will also try to figure out architecture and use reducer for business logic or create a separate files for these logic.
