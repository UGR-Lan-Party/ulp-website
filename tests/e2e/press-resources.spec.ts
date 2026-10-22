import {test,expect} from '@playwright/test';
test('Press resources offer SVG and PNG logos, corporate colours and contact',async({page,request})=>{
 await page.goto('/info/prensa/');
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
 for(const file of ['ugr-lan-party-color.svg','ugr-lan-party-blanco.svg','ulp-logos.zip']){
  const response=await request.get('/assets/prensa/'+file);expect(response.ok()).toBeTruthy();
 }
 await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
 expect(await page.locator('body').textContent()).toContain('#004465');
});
