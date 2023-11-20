import { resolve } from 'path'
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  appType: 'mpa',
      build: {
          manifest: true,
          target: 'esnext',
          rollupOptions: {
              input: {
                  
                  index: resolve(__dirname, './index.html'),
                  admin: resolve(__dirname, './ad789456.html'),
                  adminhead: resolve(__dirname, './adheader.html'),
                  adlrewards: resolve(__dirname, './adlevelrewards.html'),
                  adprofiles: resolve(__dirname, './adprofiles.html'),
                  adfeessetup: resolve(__dirname, './adfeessetup.html'),
                  addcpdist: resolve(__dirname, './addcpdistribution.html'),
                  assets: resolve(__dirname, './assets.html'),
                  //joinPlan: resolve(__dirname, './joinPlan.html'),
                  //plans: resolve(__dirname, './stakePlan.html'),
                  //promotions: resolve(__dirname, './promotions.html'),
                  referrals: resolve(__dirname, './referrals.html'),
                  //stake: resolve(__dirname, './stake.html'),
                 // swap: resolve(__dirname, './swap.html'),
                  team: resolve(__dirname, './team.html'),
                  teamlevelrewards: resolve(__dirname, './teamlevelrewards.html'),
                 // unstake: resolve(__dirname, './unstake.html'),
                  //withdrawRewards: resolve(__dirname, './withdrawRewards.html'),
                  //withdrawToken: resolve(__dirname, './withdrawToken.html'),
                  subscription: resolve(__dirname, './subscription.html'),
                  notFound: resolve(__dirname, './error.html'),
                  

              }
            },
           
      },
      plugins: [VitePWA({ registerType: 'autoUpdate' })]
    });