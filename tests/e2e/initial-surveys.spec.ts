import {test,expect} from '@playwright/test';
test('Survey archive compares real yearly votes and switches the visible columns',async({page})=>{
 await page.route('https://**',r=>r.fulfill({status:200,body:''}));
 await page.goto('/info/ediciones_anteriores/');
 const root=page.locator('[data-survey-comparison]');
 await expect(root.locator('[data-survey-metric]')).toHaveValue('votes');
 await expect(root.locator('.survey-votes').first()).toBeVisible();
 await expect(root.locator('.survey-value').first()).toBeHidden();
 await root.getByLabel('Todos los juegos').check();
 await root.getByLabel('Edición de la encuesta').selectOption('2025');
 const mario=root.locator('.survey-game').filter({has:page.getByRole('heading',{name:'Mario Kart',exact:true})});
 await expect(mario.locator('.survey-votes')).toHaveText('112');
 await expect(root.locator('.survey-game')).toHaveCount(18);
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const mode of ['percent','votes','both']){
   await root.getByLabel('Medida de las preferencias').selectOption(mode);
   if(mode==='votes') await expect(root.locator('.survey-value').first()).toBeHidden();
   else await expect(root.locator('.survey-value').first()).toBeVisible();
   if(mode==='percent') await expect(root.locator('.survey-votes').first()).toBeHidden();
   else await expect(root.locator('.survey-votes').first()).toBeVisible();
   expect(await root.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBeTruthy();
  }
 }
 await expect(root.getByText('Cómo leer la comparativa')).toHaveCount(0);
});
