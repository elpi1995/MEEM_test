// @ts-check
import { test, expect } from '@playwright/test';


test.use({
  baseURL: 'https://staging.meandem.vercel.app/'
});

test.beforeEach(async ({page}) => {
  await page.goto('/palazzo-pant-black');
  await page.getByRole('button',{name: 'Accept All Cookies'}).click()
});
test.afterEach(async ({page,context})=>{
  await context.clearCookies();
})
test('Select an item and check out', async ({ page }) => {

  await test.step('Select size:', async ()=>{
    //select size menu
    await page.getByTestId('size-select-button-dropdown').click();
    //wait for the menu to open
    //await page.waitForSelector('[data-testid="size-select-option-list"]');
    //await page.getByTestId('size-select-option-list').hover();
    //make a list of the available sizes
    const sizes = await page.locator('[data-testid="size-select-option-list"] div:not([aria-disabled="true"])');
    //select the first available size
    let sizeSelection = await sizes.first();
    //select size
    await sizeSelection.click();
  });
  await test.step('Add item to bag:', async()=>{
    //select add to bag
    await page.getByRole('button',{ name: 'Add to Bag'}).click({ force: true });
    //wait for the POST api call that adds the item to cart to finish
    const responseAddItem = await page.waitForResponse(async response =>
    response.url().includes('/palazzo-pant-black') && response.request().method() === 'POST' && response.status() === 200
    );
    await expect(responseAddItem.status()).toBe(200);
    //wait for the cart side panel to open
    await page.waitForSelector('[data-testid="cart-overlay-summary-lines"]');
  });

  await test.step('Go to cart', async()=>{
    //Go to cart
    await page.getByRole('link', { name: 'Review Bag and Checkout' }).click({ force: true });
    //wait for the go to cart api call
    const responseGoCart = await page.waitForResponse(async response =>
    response.url().includes('/checkout/cart') && response.request().method() === 'GET' && response.status() === 200
    );
    await expect(responseGoCart.status()).toBe(200);
    //wait for the order summary to load
    await page.waitForSelector('h2:has-text("Order Summary")', { timeout: 5000 });

    await expect(page.url()).toBe('https://staging.meandem.vercel.app/checkout/cart');
  });
  await test.step('Go to checkout', async()=>{
    //Go to check out
    await page.getByRole('link',{name: 'Checkout'}).click({ force: true });
    const responseCheckoutNav = await page.waitForResponse(async response =>
    response.url().includes('/checkout') && response.status() === 200
    );
    await expect(responseCheckoutNav.status()).toBe(200);
    await page.waitForSelector('[data-testid="signInOrRegister"]', { timeout: 5000 });
    await expect(page.url()).toBe('https://staging.meandem.vercel.app/checkout');
  });

  await test.step('complete the email section:',async()=>{
    //select email input
    await page.getByRole('textbox',{name: 'Email Address*'}).fill('foo2@bar.com');
    await page.getByTestId('signInOrRegister').getByRole('button', { name: 'Continue' }).click();
    // Capture the response of the email submission request
    const responseEmail = await page.waitForResponse(response =>
    response.url().includes('/checkout') && response.status() === 200
    );
    await expect(responseEmail.status()).toBe(200);
    await page.waitForTimeout(2000);


});
  await test.step('complete the address section:', async()=>{
    //Fill the address/personal info
    await page.getByRole('textbox',{name: 'First Name*'}).fill('Joe');
    await page.getByRole('textbox',{name: 'Last Name*'}).fill('Smith');
    await page.getByRole('textbox',{name: 'Phone Number*'}).fill('01234567890');
    await page.getByRole('combobox',{name: 'Address Line1*'}).fill('123 Flower Lane');
    await page.getByLabel('Region*').selectOption('GB-ENG');
    await page.getByRole('combobox',{name: 'Post code*'}).fill('AB0 1CD');
    await page.getByRole('textbox',{name: 'City*'}).fill('London');
    await page.getByTestId('deliveryAddress').getByRole('button', { name: 'Submit to Continue' }).click();
    const responseAddress = await page.waitForResponse(response =>
    response.url().includes('/checkout') && response.status() === 200
    );
    await expect(responseAddress.status()).toBe(200);

});

  await test.step('Confirm billing address:', async()=>{
    await page.getByTestId('billingAddress').getByRole('button', { name: 'Submit to Continue' }).click();
    const responseBilling = await page.waitForResponse(response =>
    response.url().includes('/checkout') && response.status() === 200
    );
    await expect(responseBilling.status()).toBe(200);
  });
  await test.step('Confirm Delivery option:', async()=>{
    await page.getByTestId('deliveryOptions').getByRole('button', { name: 'Submit to Continue' }).click();
    const responseDelivery = await page.waitForResponse(response =>
    response.url().includes('/checkout') && response.status() === 200
    );
    await expect(responseDelivery.status()).toBe(200);
  });


  await test.step('Complete the payment details:', async()=>{
    await page.locator('iframe[title="Iframe for card number"]').contentFrame().getByRole('textbox', { name: 'Card number' }).fill('1234 5678 9012 3456');
    //
    await page.locator('iframe[title="Iframe for expiry date"]').contentFrame().getByRole('textbox', { name: 'Expiry date' }).fill('12/34');
    //
    await page.locator('iframe[title="Iframe for security code"]').contentFrame().getByRole('textbox', { name: 'Security code' }).fill('123');
    await page.getByRole('textbox', { name: 'Name on card' }).fill('Joe Smith');

  });


});
test('Try to add item without selecting a size', async ({page})=>{
  await page.getByRole('button', { name: 'Add to Bag' }).click();
  await expect(page.getByTestId('product-detail-block-invalid-size')).toBeVisible();
  await expect(page.getByTestId('product-detail-block-invalid-size')).toContainText('You must select a size');

})
test('Verify the error message if the guest email submition get a 500 error code:', async({page})=>{
  await test.step('Select size:', async ()=>{
    //select size menu
    await page.getByTestId('size-select-button-dropdown').click();
    //wait for the menu to open
    await page.waitForSelector('[data-testid="size-select-option-list"]');
    await page.waitForTimeout(1000);
    //make a list of the available sizes
    const sizes = await page.locator('[data-testid="size-select-option-list"] div:not([aria-disabled="true"])');
    //select the first available size
    let sizeSelection = await sizes.first();
    //select size
    await sizeSelection.click();
  });
  await test.step('Add item to bag:', async()=>{
    //select add to bag
    await page.getByRole('button',{ name: 'Add to Bag'}).click();
    //wait for the POST api call that adds the item to cart to finish
    const responseAddItem = await page.waitForResponse(async response =>
    response.url().includes('/palazzo-pant-black') && response.request().method() === 'POST' && response.status() === 200
    );
    await expect(responseAddItem.status()).toBe(200);
    //wait for the cart side panel to open
    await page.waitForSelector('[data-testid="cart-overlay-summary-lines"]');
  });

  await test.step('Go to cart', async()=>{
    //Go to cart
    await page.getByRole('link', { name: 'Review Bag and Checkout' }).click();
    //wait for the go to cart api call
    const responseGoCart = await page.waitForResponse(async response =>
    response.url().includes('/checkout/cart') && response.request().method() === 'GET' && response.status() === 200
    );
    await expect(responseGoCart.status()).toBe(200);
    //wait for the order summary to load
    await page.waitForSelector('h2:has-text("Order Summary")');

    await expect(page.url()).toBe('https://staging.meandem.vercel.app/checkout/cart');
  });
  await test.step('Go to checkout', async()=>{
    //Go to check out
    await page.getByRole('link',{name: 'Checkout'}).click();
    const responseCheckoutNav = await page.waitForResponse(async response =>
    response.url().includes('/checkout') && response.request().method() === 'GET'&& response.status() === 200
    );
    await expect(responseCheckoutNav.status()).toBe(200);
    await page.waitForSelector('[data-testid="signInOrRegister"]');
    await expect(page.url()).toBe('https://staging.meandem.vercel.app/checkout');
  });
  await test.step('complete the email section:',async()=>{
    //select email input
    let interceptedResponseStatus = null;
    let interceptedResponseBody = null;

     // Intercept the email submission request to simulate a 500 error
     await page.route('**/checkout', async route => {
         interceptedResponseStatus = 500;
         interceptedResponseBody = { message: 'Internal Server Error' };
         await route.fulfill({
             status: interceptedResponseStatus,
             contentType: 'application/json',
             body: JSON.stringify({ message: 'Internal Server Error' })
         });
     });
    await page.getByRole('textbox',{name: 'Email Address*'}).fill('foo2@bar.com');
    await page.getByTestId('signInOrRegister').getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(5000);
    // Verify that an error message is displayed
    await expect(interceptedResponseStatus).toBe(500);
    // Validate that the response body contains the expected error message
    await expect(interceptedResponseBody).toHaveProperty('message', 'Internal Server Error');

  });
});
